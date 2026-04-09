import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { PlagiarismReportsEntity } from '../entities/plagiarism-reports.entity';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';

interface SimilarityMatch {
  submissionId: string;
  similarity: number;
  matchedLines: Array<{ sourceLine: number; targetLine: number }>;
}

@Injectable()
export class PlagiarismReportsService extends BaseService<PlagiarismReportsEntity> {
  constructor(
    @InjectRepository(PlagiarismReportsEntity)
    private readonly reportsRepository: Repository<PlagiarismReportsEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {
    super(reportsRepository);
  }

  async getLatestReportForSubmission(submissionId: string) {
    return this.reportsRepository.findOne({
      where: { submissionId },
      order: { createdAt: 'DESC' },
    });
  }

  async checkSubmissionPlagiarism(
    submissionId: string,
    threshold = 0.75,
  ): Promise<PlagiarismReportsEntity> {
    const sourceSubmission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      select: ['id', 'problemId', 'code', 'language'],
    });

    if (!sourceSubmission) {
      throw new Error('Submission not found');
    }

    const startedAt = Date.now();
    const sourceCodeNormalized = this.normalizeCode(sourceSubmission.code);
    const sourceTokens = this.tokenize(sourceCodeNormalized);
    const sourceLines = this.normalizeLines(sourceSubmission.code);

    const candidates = await this.submissionsRepository
      .createQueryBuilder('sub')
      .where('sub.problemId = :problemId', {
        problemId: sourceSubmission.problemId,
      })
      .andWhere('sub.id != :submissionId', { submissionId })
      .select(['sub.id', 'sub.code'])
      .getMany();

    const matches: SimilarityMatch[] = [];

    for (const candidate of candidates) {
      const targetCodeNormalized = this.normalizeCode(candidate.code);
      const targetTokens = this.tokenize(targetCodeNormalized);
      const similarity = this.jaccardSimilarity(sourceTokens, targetTokens);

      if (similarity >= threshold) {
        const matchedLines = this.matchLines(
          sourceLines,
          this.normalizeLines(candidate.code),
        );
        matches.push({
          submissionId: candidate.id,
          similarity: Number(similarity.toFixed(4)),
          matchedLines,
        });
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);
    const maxSimilarity = matches.length > 0 ? matches[0].similarity : 0;
    const isFlagged = maxSimilarity >= threshold;

    const report = this.reportsRepository.create({
      submissionId,
      maxSimilarity,
      isFlagged,
      matches,
      matchCount: matches.length,
      analysis: this.buildAnalysis(maxSimilarity, matches.length, threshold),
      processingTimeMs: Date.now() - startedAt,
    });

    return this.reportsRepository.save(report);
  }

  private normalizeCode(code: string): string {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/#.*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private normalizeLines(code: string): string[] {
    return code
      .split('\n')
      .map((line) =>
        line
          .replace(/\/\/.*$/g, '')
          .replace(/#.*$/g, '')
          .trim()
          .toLowerCase(),
      )
      .filter((line) => line.length > 0);
  }

  private tokenize(normalizedCode: string): Set<string> {
    const tokens = normalizedCode
      .split(/[^a-z0-9_]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 1);
    return new Set(tokens);
  }

  private jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) {
      return 1;
    }
    if (a.size === 0 || b.size === 0) {
      return 0;
    }

    let intersectionCount = 0;
    for (const token of a) {
      if (b.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = a.size + b.size - intersectionCount;
    return unionCount === 0 ? 0 : intersectionCount / unionCount;
  }

  private matchLines(
    sourceLines: string[],
    targetLines: string[],
  ): Array<{ sourceLine: number; targetLine: number }> {
    const result: Array<{ sourceLine: number; targetLine: number }> = [];
    const lineIndexMap = new Map<string, number[]>();

    targetLines.forEach((line, index) => {
      if (!lineIndexMap.has(line)) {
        lineIndexMap.set(line, []);
      }
      lineIndexMap.get(line)!.push(index + 1);
    });

    sourceLines.forEach((line, index) => {
      const targetIndexes = lineIndexMap.get(line);
      if (targetIndexes && targetIndexes.length > 0) {
        result.push({
          sourceLine: index + 1,
          targetLine: targetIndexes[0],
        });
      }
    });

    return result.slice(0, 50);
  }

  private buildAnalysis(
    maxSimilarity: number,
    matchCount: number,
    threshold: number,
  ): string {
    if (matchCount === 0) {
      return 'No high-similarity submissions found.';
    }

    if (maxSimilarity >= threshold) {
      return `High similarity detected: ${(maxSimilarity * 100).toFixed(2)}% with ${matchCount} matching submission(s). Manual review is recommended.`;
    }

    return `Similarity checks completed: maximum similarity ${(maxSimilarity * 100).toFixed(2)}%.`;
  }
}
