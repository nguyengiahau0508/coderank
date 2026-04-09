import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';
import { SubmissionStatusEnum } from 'src/common/enums/enums';

@Injectable()
export class ErrorExplanationService {
  constructor(
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {}

  async explainSubmissionError(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
    forceRegenerate = false,
  ) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      select: [
        'id',
        'status',
        'errorMessage',
        'output',
        'code',
        'language',
        'aiErrorExplanation',
        'aiErrorExplanationVi',
        'aiFixSuggestions',
      ],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (!forceRegenerate) {
      if (lang === 'vi' && submission.aiErrorExplanationVi) {
        return {
          submissionId: submission.id,
          status: submission.status,
          explanation: submission.aiErrorExplanationVi,
          suggestions: submission.aiFixSuggestions || [],
          language: 'vi',
          cached: true,
        };
      }
      if (lang === 'en' && submission.aiErrorExplanation) {
        return {
          submissionId: submission.id,
          status: submission.status,
          explanation: submission.aiErrorExplanation,
          suggestions: submission.aiFixSuggestions || [],
          language: 'en',
          cached: true,
        };
      }
    }

    const analysis = this.analyzeError(
      submission.status,
      submission.errorMessage,
      submission.output,
      submission.code,
    );

    await this.submissionsRepository.update(submissionId, {
      aiErrorExplanation: analysis.explanationEn,
      aiErrorExplanationVi: analysis.explanationVi,
      aiFixSuggestions: analysis.suggestions,
    });

    return {
      submissionId: submission.id,
      status: submission.status,
      explanation:
        lang === 'vi' ? analysis.explanationVi : analysis.explanationEn,
      suggestions: analysis.suggestions,
      language: lang,
      cached: false,
    };
  }

  private analyzeError(
    status: SubmissionStatusEnum,
    errorMessage?: string,
    output?: string,
    code?: string,
  ) {
    switch (status) {
      case SubmissionStatusEnum.WrongAnswer:
        return {
          explanationEn:
            'Your program runs but produces incorrect output for at least one testcase. The algorithm may miss edge cases or violate the expected format.',
          explanationVi:
            'Chương trình chạy được nhưng cho kết quả sai ở ít nhất một test. Thuật toán có thể thiếu xử lý edge case hoặc sai định dạng output.',
          suggestions: [
            'Compare your output format exactly with the problem specification.',
            'Test edge cases: empty input, minimum/maximum constraints, duplicate values.',
            'Dry-run your logic step by step on sample and custom tests.',
          ],
        };
      case SubmissionStatusEnum.CompilationError:
        return {
          explanationEn: `Compilation failed. The compiler could not build your code.${errorMessage ? ` Details: ${errorMessage}` : ''}`,
          explanationVi: `Lỗi biên dịch. Trình biên dịch không thể build code của bạn.${errorMessage ? ` Chi tiết: ${errorMessage}` : ''}`,
          suggestions: [
            'Check syntax errors (missing semicolons, brackets, indentation).',
            'Verify imports/includes and function signatures.',
            'Make sure variable and function names are declared before use.',
          ],
        };
      case SubmissionStatusEnum.RuntimeError:
        return {
          explanationEn: `Your program crashed while running.${errorMessage ? ` Details: ${errorMessage}` : ''}`,
          explanationVi: `Chương trình bị crash khi chạy.${errorMessage ? ` Chi tiết: ${errorMessage}` : ''}`,
          suggestions: [
            'Guard array/string index access and null/undefined values.',
            'Check division by zero and invalid type conversions.',
            'Add defensive checks before accessing data structures.',
          ],
        };
      case SubmissionStatusEnum.TimeLimitExceeded:
        return {
          explanationEn:
            'Your solution exceeded the time limit. Current algorithm complexity is likely too high for input constraints.',
          explanationVi:
            'Bài làm vượt quá giới hạn thời gian. Độ phức tạp thuật toán hiện tại có thể quá cao so với ràng buộc đầu vào.',
          suggestions: [
            'Reduce nested loops and avoid repeated scans on large inputs.',
            'Use faster data structures (hash map/set, prefix sums, two pointers, binary search).',
            'Precompute reusable values instead of recalculating in loops.',
          ],
        };
      case SubmissionStatusEnum.MemoryLimitExceeded:
        return {
          explanationEn:
            'Your solution exceeded the memory limit. Large intermediate structures or duplicated data may be the cause.',
          explanationVi:
            'Bài làm vượt quá giới hạn bộ nhớ. Nguyên nhân có thể do dùng cấu trúc dữ liệu trung gian quá lớn hoặc sao chép dữ liệu nhiều lần.',
          suggestions: [
            'Avoid storing unnecessary copies of arrays/strings.',
            'Use in-place operations where possible.',
            'Prefer iterative approaches and compact data representations.',
          ],
        };
      case SubmissionStatusEnum.Accepted:
        return {
          explanationEn:
            'Your submission is accepted. No error explanation is needed.',
          explanationVi: 'Bài nộp đã đúng. Không cần giải thích lỗi.',
          suggestions: [
            'Try optimizing for better time/memory complexity.',
            'Refactor code for readability and maintainability.',
          ],
        };
      default:
        return {
          explanationEn: `Submission failed with status "${status}".${output ? ` Last output: ${output}` : ''}`,
          explanationVi: `Bài nộp thất bại với trạng thái "${status}".${output ? ` Output gần nhất: ${output}` : ''}`,
          suggestions: [
            'Read problem constraints and output format carefully.',
            'Reproduce the failure with small custom tests.',
            'Check logs/error details to identify failing logic.',
          ],
        };
    }
  }
}
