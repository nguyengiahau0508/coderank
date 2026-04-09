import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentService } from 'src/modules/agent/agent.service';
import { UserAiConfigService } from 'src/modules/agent/user-ai-config.service';
import { ProblemsService } from 'src/modules/problems/services/problems.service';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';
import {
  AiProviderEnum,
  ProgrammingLanguageEnum,
  RolesEnum,
} from 'src/common/enums/enums';

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly agentService: AgentService,
    private readonly userAiConfigService: UserAiConfigService,
    private readonly problemsService: ProblemsService,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {}

  async suggestAlgorithm(
    problemId: string,
    userId: string,
    userToken: string,
    role: RolesEnum,
    options?: {
      code?: string;
      language?: ProgrammingLanguageEnum;
      lang?: 'vi' | 'en';
      provider?: AiProviderEnum;
    },
  ) {
    const problem = await this.problemsService.findOne({
      where: { id: problemId },
      select: ['id', 'title', 'description', 'inputDescription', 'outputDescription', 'difficulty'],
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const lang = options?.lang ?? 'vi';
    const prompt =
      lang === 'vi'
        ? `Hãy gợi ý thuật toán phù hợp cho bài toán sau.\n\nTiêu đề: ${problem.title}\nĐộ khó: ${problem.difficulty}\nMô tả: ${problem.description || ''}\nInput: ${problem.inputDescription || ''}\nOutput: ${problem.outputDescription || ''}\nCode hiện tại: ${options?.code || '(chưa có)'}\nNgôn ngữ: ${options?.language || 'unknown'}\n\nYêu cầu trả về dạng markdown ngắn gọn gồm:\n1) Thuật toán khuyến nghị (tên + lý do)\n2) Độ phức tạp thời gian/bộ nhớ\n3) Khi nào nên chọn thuật toán thay thế\n4) Pseudocode ngắn (không đưa full lời giải).`
        : `Suggest suitable algorithms for this problem.\n\nTitle: ${problem.title}\nDifficulty: ${problem.difficulty}\nDescription: ${problem.description || ''}\nInput: ${problem.inputDescription || ''}\nOutput: ${problem.outputDescription || ''}\nCurrent code: ${options?.code || '(none)'}\nLanguage: ${options?.language || 'unknown'}\n\nReturn concise markdown with:\n1) Recommended algorithm(s) with rationale\n2) Time/space complexity\n3) Alternative choices and when to use them\n4) Short pseudocode (no full final solution).`;

    const aiConfig = await this.resolveAiConfig(userId, options?.provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      problemId,
      language: lang,
      suggestion: message,
    };
  }

  async suggestDataStructure(
    problemId: string,
    userId: string,
    userToken: string,
    role: RolesEnum,
    options?: {
      code?: string;
      language?: ProgrammingLanguageEnum;
      lang?: 'vi' | 'en';
      provider?: AiProviderEnum;
    },
  ) {
    const problem = await this.problemsService.findOne({
      where: { id: problemId },
      select: ['id', 'title', 'description', 'inputDescription', 'outputDescription', 'difficulty'],
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const lang = options?.lang ?? 'vi';
    const prompt =
      lang === 'vi'
        ? `Hãy đề xuất cấu trúc dữ liệu tối ưu cho bài toán sau.\n\nTiêu đề: ${problem.title}\nĐộ khó: ${problem.difficulty}\nMô tả: ${problem.description || ''}\nInput: ${problem.inputDescription || ''}\nOutput: ${problem.outputDescription || ''}\nCode hiện tại: ${options?.code || '(chưa có)'}\nNgôn ngữ: ${options?.language || 'unknown'}\n\nYêu cầu trả về:\n1) DS đề xuất chính và lý do\n2) Trade-off bộ nhớ/tốc độ\n3) DS thay thế\n4) Cấu trúc dữ liệu nên tránh cho bài này.`
        : `Recommend optimal data structures for this problem.\n\nTitle: ${problem.title}\nDifficulty: ${problem.difficulty}\nDescription: ${problem.description || ''}\nInput: ${problem.inputDescription || ''}\nOutput: ${problem.outputDescription || ''}\nCurrent code: ${options?.code || '(none)'}\nLanguage: ${options?.language || 'unknown'}\n\nReturn:\n1) Primary recommended data structure(s) with rationale\n2) Memory/time trade-offs\n3) Alternatives\n4) Data structures to avoid for this problem.`;

    const aiConfig = await this.resolveAiConfig(userId, options?.provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      problemId,
      language: lang,
      suggestion: message,
    };
  }

  async debugSubmission(
    submissionId: string,
    userId: string,
    userToken: string,
    role: RolesEnum,
    lang: 'vi' | 'en' = 'vi',
    provider?: AiProviderEnum,
  ) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['problem'],
      select: ['id', 'code', 'language', 'status', 'errorMessage', 'output'],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    const prompt =
      lang === 'vi'
        ? `Bạn là trợ lý debug cho sinh viên.\nBài: ${submission.problem?.title || 'Unknown'}\nMô tả: ${submission.problem?.description || ''}\nNgôn ngữ: ${submission.language}\nStatus: ${submission.status}\nError: ${submission.errorMessage || '(none)'}\nOutput: ${submission.output || '(none)'}\nCode:\n${submission.code}\n\nHãy trả lời theo dạng:\n1) Nguyên nhân gốc có khả năng cao\n2) Vị trí đoạn code nghi ngờ\n3) Các bước sửa theo thứ tự (không đưa full code hoàn chỉnh)\n4) 3 test case nhỏ để tự kiểm tra sau khi sửa.`
        : `You are a debugging tutor for students.\nProblem: ${submission.problem?.title || 'Unknown'}\nDescription: ${submission.problem?.description || ''}\nLanguage: ${submission.language}\nStatus: ${submission.status}\nError: ${submission.errorMessage || '(none)'}\nOutput: ${submission.output || '(none)'}\nCode:\n${submission.code}\n\nRespond with:\n1) Most likely root cause\n2) Suspicious code region\n3) Ordered fix steps (no full final code)\n4) 3 small test cases to validate after fixing.`;

    const aiConfig = await this.resolveAiConfig(userId, provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      submissionId,
      language: lang,
      debugGuidance: message,
    };
  }

  async explainSubmissionSolution(
    submissionId: string,
    userId: string,
    userToken: string,
    role: RolesEnum,
    lang: 'vi' | 'en' = 'vi',
    detail: 'brief' | 'detailed' = 'detailed',
    provider?: AiProviderEnum,
  ) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['problem'],
      select: ['id', 'code', 'language'],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    const prompt =
      lang === 'vi'
        ? `Giải thích lời giải sau cho sinh viên.\nMức độ chi tiết: ${detail}\nBài: ${submission.problem?.title || 'Unknown'}\nCode (${submission.language}):\n${submission.code}\n\nYêu cầu:\n- Giải thích từng khối logic\n- Nêu ý tưởng thuật toán\n- Nêu độ phức tạp\n- Chỉ ra điểm dễ sai.`
        : `Explain this solution to a student.\nDetail level: ${detail}\nProblem: ${submission.problem?.title || 'Unknown'}\nCode (${submission.language}):\n${submission.code}\n\nInclude:\n- Explanation by logical blocks\n- Core algorithm idea\n- Complexity analysis\n- Common pitfalls.`;

    const aiConfig = await this.resolveAiConfig(userId, provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      submissionId,
      language: lang,
      explanation: message,
    };
  }

  async suggestOptimization(
    submissionId: string,
    userId: string,
    userToken: string,
    role: RolesEnum,
    lang: 'vi' | 'en' = 'vi',
    provider?: AiProviderEnum,
  ) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['problem'],
      select: ['id', 'code', 'language', 'status', 'executionTimeMs', 'memoryUsedMb'],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    const prompt =
      lang === 'vi'
        ? `Phân tích tối ưu hóa cho đoạn code sau.\nBài: ${submission.problem?.title || 'Unknown'}\nNgôn ngữ: ${submission.language}\nExecution time: ${submission.executionTimeMs ?? 'n/a'}ms\nMemory: ${submission.memoryUsedMb ?? 'n/a'}MB\nCode:\n${submission.code}\n\nTrả về:\n1) Điểm nghẽn hiệu năng chính\n2) Cải tiến time complexity\n3) Cải tiến memory usage\n4) Mức tác động dự kiến (thấp/vừa/cao).`
        : `Analyze optimization opportunities for this code.\nProblem: ${submission.problem?.title || 'Unknown'}\nLanguage: ${submission.language}\nExecution time: ${submission.executionTimeMs ?? 'n/a'}ms\nMemory: ${submission.memoryUsedMb ?? 'n/a'}MB\nCode:\n${submission.code}\n\nReturn:\n1) Main performance bottlenecks\n2) Time complexity improvements\n3) Memory usage improvements\n4) Expected impact (low/medium/high).`;

    const aiConfig = await this.resolveAiConfig(userId, provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      submissionId,
      language: lang,
      optimization: message,
    };
  }

  async translateCode(
    sourceCode: string,
    sourceLanguage: ProgrammingLanguageEnum,
    targetLanguage: ProgrammingLanguageEnum,
    userId: string,
    userToken: string,
    role: RolesEnum,
    provider?: AiProviderEnum,
  ) {
    const prompt = `Translate this code from ${sourceLanguage} to ${targetLanguage}. Keep the same algorithmic behavior and edge-case handling.\n\nReturn format:\n1) Translated code only in a fenced code block\n2) Short notes about language-specific changes.\n\nSource code:\n${sourceCode}`;

    const aiConfig = await this.resolveAiConfig(userId, provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      sourceLanguage,
      targetLanguage,
      result: message,
    };
  }

  async generateProblemDraft(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    userId: string,
    userToken: string,
    role: RolesEnum,
    options?: {
      constraints?: string;
      lang?: 'vi' | 'en';
      provider?: AiProviderEnum;
    },
  ) {
    const lang = options?.lang ?? 'vi';
    const prompt =
      lang === 'vi'
        ? `Tạo bản nháp đề bài lập trình cho giảng viên.\n\nChủ đề: ${topic}\nĐộ khó: ${difficulty}\nRàng buộc: ${options?.constraints || '(tự đề xuất)'}\n\nTrả về theo markdown có cấu trúc:\n1) Tiêu đề bài\n2) Mô tả bài toán\n3) Input / Output\n4) Constraints\n5) 2 ví dụ input-output\n6) 3 gợi ý theo mức tăng dần\n7) Danh sách tags`
        : `Generate a programming problem draft for instructors.\n\nTopic: ${topic}\nDifficulty: ${difficulty}\nConstraints: ${options?.constraints || '(propose suitable constraints)'}\n\nReturn structured markdown with:\n1) Title\n2) Problem statement\n3) Input / Output\n4) Constraints\n5) Two sample I/O pairs\n6) Three progressive hints\n7) Suggested tags`;

    const aiConfig = await this.resolveAiConfig(userId, options?.provider);
    const message = await this.agentService.chat(
      prompt,
      userToken,
      role,
      aiConfig ?? undefined,
    );
    return {
      topic,
      difficulty,
      language: lang,
      draft: message,
    };
  }

  private async resolveAiConfig(
    userId: string,
    provider?: AiProviderEnum,
  ) {
    if (!provider) {
      return null;
    }
    return this.userAiConfigService.findByUserIdAndProviderWithApiKey(
      userId,
      provider,
    );
  }
}
