import { createInternalClient } from '../../api/api-client';
import { LLMFactory, LLMProviderType } from '../llm/llm.factory';
import type { ILLMConfig } from '../llm/llm.interface';
import { promisify } from 'util';
import { execFile } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execFileAsync = promisify(execFile);

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.angular',
  '.vscode',
  '.idea',
  'coverage',
  'vendor',
]);

const READABLE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.xml',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.java',
  '.kt',
  '.py',
  '.cpp',
  '.cc',
  '.cxx',
  '.c',
  '.h',
  '.hpp',
  '.cs',
  '.go',
  '.rs',
  '.php',
  '.rb',
  '.swift',
  '.sql',
  '.sh',
  '.bash',
  '.zsh',
  '.bat',
  '.ps1',
  '.env',
  '.ini',
  '.toml',
  '.vue',
  '.svelte',
  '.gradle',
  '.properties',
]);

const MAX_FILES_PER_SUBMISSION = 80;
const MAX_FILE_BYTES = 400 * 1024;
const MAX_FILE_CHARS = 12000;
const MAX_TOTAL_CHARS = 140000;
const MAX_SIMILARITY_MATCHES = 5;

type SubmissionFileInfo = {
  fileId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

type CourseAssignmentSubmission = {
  id: string;
  assignmentId: string;
  authorId: string;
  content?: string;
  submissionFiles?: SubmissionFileInfo[];
  status: string;
  attemptNumber: number;
  submittedAt: string;
};

type GradingCriterion = {
  criterion: string;
  description?: string;
  maxScore: number;
};

type SubmissionFileSnippet = {
  relativePath: string;
  content: string;
};

type SubmissionPreparedData = {
  submission: CourseAssignmentSubmission;
  snippets: SubmissionFileSnippet[];
  similarityTokens: Set<string>;
  combinedSource: string;
};

type GradeRequestPayload = {
  userToken: string;
  role?: string;
  provider?: string;
  modelName?: string;
  apiKey?: string;
  baseHost?: string;
  courseId: string;
  lessonId: string;
  assignmentId: string;
  submissionIds?: string[];
  similarityThreshold?: number;
  defaultMaxScore?: number;
  gradingCriteria?: GradingCriterion[];
  assignmentTitle?: string;
  assignmentDescription?: string;
};

type LlmCriterionScore = {
  criterion: string;
  maxScore: number;
  score: number;
  feedback?: string;
};

type LlmGradeJson = {
  criterionScores?: Array<{
    criterion: string;
    score: number;
    feedback?: string;
  }>;
  totalScore?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  confidence?: number;
};

type BatchGradeResult = {
  assignmentId: string;
  gradedCount: number;
  flaggedCount: number;
  results: Array<{
    submissionId: string;
    status: string;
    score?: number;
    feedback?: string;
    isSimilarityFlagged: boolean;
    maxSimilarityScore?: number;
    similarityMatches: Array<{
      submissionId: string;
      authorId: string;
      similarity: number;
    }>;
    aiGradingResult: {
      rubricUsed: GradingCriterion[];
      criterionScores?: LlmCriterionScore[];
      score: number;
      maxScore: number;
      percentageScore: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      confidence: number;
      evaluatedFileCount: number;
      generatedAt: string;
      graderProvider?: string;
      graderModel?: string;
      error?: string;
    };
  }>;
};

const ASSIGNMENT_GRADING_SYSTEM_PROMPT = `You are an assignment grading assistant.
You will grade student project submissions using provided rubric criteria.
Return JSON only, no markdown, no code fences, no extra commentary.`;

const unwrapApiData = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as any).data !== undefined
  ) {
    return (payload as any).data as T;
  }
  return payload as T;
};

const safeFileName = (fileName: string): string =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeForSimilarity = (source: string): string =>
  source
    .toLowerCase()
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/#.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (source: string): Set<string> => {
  if (!source) {
    return new Set();
  }

  const tokens = source
    .split(/[^a-z0-9_]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

  return new Set(tokens);
};

const jaccardSimilarity = (left: Set<string>, right: Set<string>): number => {
  if (left.size === 0 && right.size === 0) {
    return 1;
  }
  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) {
      intersection++;
    }
  }

  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

const extractJsonObject = (raw: string): LlmGradeJson => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('LLM returned empty grading response');
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || trimmed;

  try {
    return JSON.parse(candidate) as LlmGradeJson;
  } catch {
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      throw new Error('LLM grading response is not valid JSON');
    }

    const objectLike = candidate.slice(firstBrace, lastBrace + 1);
    return JSON.parse(objectLike) as LlmGradeJson;
  }
};

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback;
};

const isLikelyText = (content: Buffer): boolean => {
  if (content.length === 0) {
    return true;
  }

  const sampleSize = Math.min(content.length, 4096);
  let nonText = 0;

  for (let i = 0; i < sampleSize; i++) {
    const byte = content[i];
    if (byte === 0) {
      return false;
    }

    const isControl = byte < 9 || (byte > 13 && byte < 32);
    if (isControl) {
      nonText++;
    }
  }

  return nonText / sampleSize < 0.1;
};

const shouldIncludeFile = (filePath: string, size: number): boolean => {
  const ext = path.extname(filePath).toLowerCase();
  if (READABLE_EXTENSIONS.has(ext)) {
    return true;
  }

  return size <= 100 * 1024;
};

const isZipFile = (file: SubmissionFileInfo): boolean => {
  const lowerName = (file.fileName || '').toLowerCase();
  const lowerMime = (file.mimeType || '').toLowerCase();

  return (
    lowerName.endsWith('.zip') ||
    lowerMime.includes('zip') ||
    lowerMime.includes('compressed')
  );
};

const buildDefaultRubric = (maxScore: number): GradingCriterion[] => {
  const safeMaxScore = Math.max(1, maxScore);

  const ratios = [0.4, 0.3, 0.2, 0.1];
  const labels: GradingCriterion[] = [
    {
      criterion: 'Functionality',
      description: 'Completeness and correctness of required features',
      maxScore: 0,
    },
    {
      criterion: 'Code Quality',
      description: 'Readability, maintainability, and clean structure',
      maxScore: 0,
    },
    {
      criterion: 'Project Structure',
      description: 'Organization, modularity, and file structure',
      maxScore: 0,
    },
    {
      criterion: 'Documentation',
      description: 'Comments and documentation quality',
      maxScore: 0,
    },
  ];

  let assigned = 0;
  const lastIndex = labels.length - 1;
  for (let i = 0; i < labels.length; i++) {
    if (i === lastIndex) {
      labels[i].maxScore = safeMaxScore - assigned;
    } else {
      const score = Math.max(1, Math.round(safeMaxScore * ratios[i]));
      labels[i].maxScore = score;
      assigned += score;
    }
  }

  return labels;
};

const normalizeRubric = (
  criteria: GradingCriterion[] | undefined,
  maxScore: number,
): GradingCriterion[] => {
  if (!criteria || criteria.length === 0) {
    return buildDefaultRubric(maxScore);
  }

  const sanitized = criteria
    .filter((item) => item && item.criterion && Number.isFinite(item.maxScore))
    .map((item) => ({
      criterion: item.criterion.trim(),
      description: item.description?.trim(),
      maxScore: Math.max(0, Math.round(item.maxScore)),
    }))
    .filter((item) => item.criterion.length > 0 && item.maxScore > 0);

  if (sanitized.length === 0) {
    return buildDefaultRubric(maxScore);
  }

  return sanitized;
};

export class AssignmentSubmissionGrader {
  async grade(payload: GradeRequestPayload): Promise<BatchGradeResult> {
    if (!payload.userToken) {
      throw new Error('Missing userToken');
    }

    const client = createInternalClient(payload.userToken);
    const similarityThreshold = clamp(
      toNumber(payload.similarityThreshold, 0.85),
      0,
      1,
    );
    const defaultMaxScore = Math.max(1, Math.round(payload.defaultMaxScore || 100));
    const rubric = normalizeRubric(payload.gradingCriteria, defaultMaxScore);
    const maxPossibleScore = rubric.reduce((sum, item) => sum + item.maxScore, 0);

    const submissionsResponse = await client.get(
      `/courses/${payload.courseId}/lessons/${payload.lessonId}/assignments/${payload.assignmentId}/submissions`,
    );

    const allSubmissions = unwrapApiData<CourseAssignmentSubmission[]>(
      submissionsResponse.data,
    );

    if (!Array.isArray(allSubmissions) || allSubmissions.length === 0) {
      return {
        assignmentId: payload.assignmentId,
        gradedCount: 0,
        flaggedCount: 0,
        results: [],
      };
    }

    const latestByAuthor = new Map<string, CourseAssignmentSubmission>();
    for (const submission of allSubmissions) {
      const current = latestByAuthor.get(submission.authorId);
      if (!current || submission.attemptNumber > current.attemptNumber) {
        latestByAuthor.set(submission.authorId, submission);
      }
    }

    const latestSubmissions = Array.from(latestByAuthor.values());
    const targetSubmissions = payload.submissionIds?.length
      ? allSubmissions.filter((submission) =>
          payload.submissionIds!.includes(submission.id),
        )
      : latestSubmissions;

    if (targetSubmissions.length === 0) {
      return {
        assignmentId: payload.assignmentId,
        gradedCount: 0,
        flaggedCount: 0,
        results: [],
      };
    }

    const poolById = new Map<string, CourseAssignmentSubmission>();
    for (const submission of latestSubmissions) {
      poolById.set(submission.id, submission);
    }
    for (const submission of targetSubmissions) {
      if (!poolById.has(submission.id)) {
        poolById.set(submission.id, submission);
      }
    }

    const poolSubmissions = Array.from(poolById.values());
    const tempRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'coderank-assignment-grading-'),
    );

    try {
      const preparedMap = new Map<string, SubmissionPreparedData>();

      for (const submission of poolSubmissions) {
        const prepared = await this.prepareSubmissionData({
          client,
          payload,
          submission,
          tempRoot,
        });
        preparedMap.set(submission.id, prepared);
      }

      const llmConfig: ILLMConfig | undefined =
        payload.apiKey || payload.baseHost
          ? {
              apiKey: payload.apiKey,
              baseHost: payload.baseHost,
            }
          : undefined;

      const providerSelection = LLMFactory.createProviderWithFallback(
        payload.provider,
        payload.modelName,
        llmConfig,
      );
      const provider = providerSelection.provider;
      const providerName = providerSelection.actualType;
      const modelName = payload.modelName;

      const results: BatchGradeResult['results'] = [];
      let flaggedCount = 0;

      for (const submission of targetSubmissions) {
        const prepared = preparedMap.get(submission.id);
        if (!prepared) {
          throw new Error(`Missing prepared data for submission ${submission.id}`);
        }

        const similarityMatches = this.computeSimilarityMatches(
          submission.id,
          preparedMap,
          similarityThreshold,
        );
        const maxSimilarityScore = similarityMatches[0]?.similarity;
        const isSimilarityFlagged = similarityMatches.length > 0;
        if (isSimilarityFlagged) {
          flaggedCount++;
        }

        try {
          const grading = await this.gradeSingleSubmission({
            provider,
            providerName,
            modelName,
            payload,
            rubric,
            maxPossibleScore,
            prepared,
          });

          results.push({
            submissionId: submission.id,
            status: 'graded',
            score: grading.score,
            feedback: grading.feedback,
            isSimilarityFlagged,
            maxSimilarityScore,
            similarityMatches,
            aiGradingResult: grading,
          });
        } catch (error: any) {
          const failedResult = {
            rubricUsed: rubric,
            criterionScores: [],
            score: 0,
            maxScore: maxPossibleScore,
            percentageScore: 0,
            feedback: `AI grading failed: ${error.message}`,
            strengths: [],
            improvements: [],
            confidence: 0,
            evaluatedFileCount: prepared.snippets.length,
            generatedAt: new Date().toISOString(),
            graderProvider: providerName,
            graderModel: modelName,
            error: error.message,
          };

          results.push({
            submissionId: submission.id,
            status: submission.status || 'submitted',
            feedback: failedResult.feedback,
            isSimilarityFlagged,
            maxSimilarityScore,
            similarityMatches,
            aiGradingResult: failedResult,
          });
        }
      }

      return {
        assignmentId: payload.assignmentId,
        gradedCount: results.length,
        flaggedCount,
        results,
      };
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  }

  private async gradeSingleSubmission(params: {
    provider: ReturnType<typeof LLMFactory.createProviderWithFallback>['provider'];
    providerName: LLMProviderType;
    modelName?: string;
    payload: GradeRequestPayload;
    rubric: GradingCriterion[];
    maxPossibleScore: number;
    prepared: SubmissionPreparedData;
  }): Promise<BatchGradeResult['results'][number]['aiGradingResult']> {
    const { provider, providerName, modelName, payload, rubric, maxPossibleScore, prepared } =
      params;

    if (!prepared.combinedSource.trim()) {
      throw new Error('Submission has no readable content for AI grading');
    }

    provider.init(ASSIGNMENT_GRADING_SYSTEM_PROMPT, [], []);

    const filesSection = prepared.snippets
      .map(
        (snippet) =>
          `FILE: ${snippet.relativePath}\n---\n${snippet.content}`,
      )
      .join('\n\n====================\n\n');

    const prompt = [
      `Assignment title: ${payload.assignmentTitle || '(untitled assignment)'}`,
      `Assignment description: ${payload.assignmentDescription || '(no description provided)'}`,
      `Submission ID: ${prepared.submission.id}`,
      `Student ID: ${prepared.submission.authorId}`,
      `Rubric: ${JSON.stringify(rubric)}`,
      `Grade the submission based on the rubric.`,
      `Return STRICT JSON with schema:`,
      `{"criterionScores":[{"criterion":"string","score":number,"feedback":"string"}],"totalScore":number,"feedback":"string","strengths":["string"],"improvements":["string"],"confidence":number}`,
      `Do not include markdown fences.`,
      `Submission content:\n${filesSection}`,
    ].join('\n\n');

    const llmResponse = await provider.sendMessage(prompt);
    if (!llmResponse.text) {
      throw new Error('LLM returned no text response for grading');
    }
    if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
      throw new Error('Unexpected tool calls during grading response');
    }

    const parsed = extractJsonObject(llmResponse.text);

    const criterionScores: LlmCriterionScore[] = rubric.map((criterion) => {
      const matched = parsed.criterionScores?.find(
        (item) =>
          item.criterion?.toLowerCase().trim() ===
          criterion.criterion.toLowerCase().trim(),
      );

      const rawScore = toNumber(matched?.score, 0);
      return {
        criterion: criterion.criterion,
        maxScore: criterion.maxScore,
        score: Number(clamp(rawScore, 0, criterion.maxScore).toFixed(2)),
        feedback: matched?.feedback,
      };
    });

    const totalScore = Number(
      clamp(
        criterionScores.reduce((sum, item) => sum + item.score, 0),
        0,
        maxPossibleScore,
      ).toFixed(2),
    );

    const feedback =
      typeof parsed.feedback === 'string' && parsed.feedback.trim().length > 0
        ? parsed.feedback.trim()
        : 'AI grading completed.';

    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((item) => typeof item === 'string').slice(0, 8)
      : [];
    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements
          .filter((item) => typeof item === 'string')
          .slice(0, 8)
      : [];

    const confidence = Number(clamp(toNumber(parsed.confidence, 0.7), 0, 1).toFixed(3));

    return {
      rubricUsed: rubric,
      criterionScores,
      score: totalScore,
      maxScore: maxPossibleScore,
      percentageScore: Number(((totalScore / maxPossibleScore) * 100).toFixed(2)),
      feedback,
      strengths,
      improvements,
      confidence,
      evaluatedFileCount: prepared.snippets.length,
      generatedAt: new Date().toISOString(),
      graderProvider: providerName,
      graderModel: modelName,
    };
  }

  private async prepareSubmissionData(params: {
    client: ReturnType<typeof createInternalClient>;
    payload: GradeRequestPayload;
    submission: CourseAssignmentSubmission;
    tempRoot: string;
  }): Promise<SubmissionPreparedData> {
    const { client, payload, submission, tempRoot } = params;
    const submissionDir = path.join(tempRoot, submission.id);
    await fs.mkdir(submissionDir, { recursive: true });

    const extractedRoots: string[] = [];

    for (let i = 0; i < (submission.submissionFiles || []).length; i++) {
      const file = submission.submissionFiles![i];
      const localFileName = `${i}-${safeFileName(file.fileName || `file-${i}`)}`;
      const localFilePath = path.join(submissionDir, localFileName);

      const response = await client.get(
        `/courses/${payload.courseId}/lessons/${payload.lessonId}/assignments/${payload.assignmentId}/submissions/${submission.id}/download`,
        {
          params: { fileIndex: i },
          responseType: 'arraybuffer',
        },
      );

      await fs.writeFile(localFilePath, Buffer.from(response.data));

      if (isZipFile(file)) {
        const unzipTarget = path.join(submissionDir, `unzipped-${i}`);
        await fs.mkdir(unzipTarget, { recursive: true });

        try {
          await execFileAsync('unzip', ['-oq', localFilePath, '-d', unzipTarget], {
            maxBuffer: 10 * 1024 * 1024,
          });
          extractedRoots.push(unzipTarget);
        } catch (error: any) {
          throw new Error(
            `Unable to extract zip file "${file.fileName}": ${error.message}`,
          );
        }
      } else {
        extractedRoots.push(localFilePath);
      }
    }

    const snippets: SubmissionFileSnippet[] = [];
    let totalChars = 0;

    if (submission.content?.trim()) {
      const content = submission.content.trim().slice(0, MAX_FILE_CHARS);
      snippets.push({
        relativePath: 'submission-content.txt',
        content,
      });
      totalChars += content.length;
    }

    for (const root of extractedRoots) {
      const stat = await fs.stat(root);
      const candidatePaths = stat.isDirectory()
        ? await this.collectFiles(root)
        : [root];

      for (const candidatePath of candidatePaths) {
        if (snippets.length >= MAX_FILES_PER_SUBMISSION) {
          break;
        }

        const fileStat = await fs.stat(candidatePath);
        if (fileStat.size > MAX_FILE_BYTES) {
          continue;
        }
        if (!shouldIncludeFile(candidatePath, fileStat.size)) {
          continue;
        }

        const buffer = await fs.readFile(candidatePath);
        if (!isLikelyText(buffer)) {
          continue;
        }

        let content = buffer.toString('utf8').replace(/\r\n/g, '\n').trim();
        if (!content) {
          continue;
        }

        if (content.length > MAX_FILE_CHARS) {
          content = `${content.slice(
            0,
            MAX_FILE_CHARS,
          )}\n\n/* truncated for grading */`;
        }

        if (totalChars + content.length > MAX_TOTAL_CHARS) {
          continue;
        }

        snippets.push({
          relativePath: path.relative(submissionDir, candidatePath),
          content,
        });
        totalChars += content.length;
      }
    }

    const combinedSource = snippets.map((item) => item.content).join('\n');
    const similarityTokens = tokenize(normalizeForSimilarity(combinedSource));

    return {
      submission,
      snippets,
      similarityTokens,
      combinedSource,
    };
  }

  private async collectFiles(root: string): Promise<string[]> {
    const files: string[] = [];
    const queue = [root];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const entries = await fs.readdir(current, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.DS_Store')) {
          continue;
        }

        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name.toLowerCase())) {
            queue.push(fullPath);
          }
          continue;
        }

        if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  private computeSimilarityMatches(
    targetSubmissionId: string,
    preparedMap: Map<string, SubmissionPreparedData>,
    threshold: number,
  ): Array<{ submissionId: string; authorId: string; similarity: number }> {
    const target = preparedMap.get(targetSubmissionId);
    if (!target) {
      return [];
    }

    const matches: Array<{
      submissionId: string;
      authorId: string;
      similarity: number;
    }> = [];

    for (const [candidateId, candidate] of preparedMap.entries()) {
      if (candidateId === targetSubmissionId) {
        continue;
      }

      const similarity = jaccardSimilarity(
        target.similarityTokens,
        candidate.similarityTokens,
      );
      if (similarity >= threshold) {
        matches.push({
          submissionId: candidateId,
          authorId: candidate.submission.authorId,
          similarity: Number(similarity.toFixed(4)),
        });
      }
    }

    return matches
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, MAX_SIMILARITY_MATCHES);
  }
}
