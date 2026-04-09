import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { AiGradingsEntity } from '../entities/ai-gradings.entity';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';

interface RubricCriterion {
  criterion: string;
  criterionVi?: string;
  maxScore: number;
  description?: string;
}

interface GradingResult {
  rubricScores: {
    criterion: string;
    criterionVi?: string;
    maxScore: number;
    score: number;
    feedback: string;
    feedbackVi?: string;
  }[];
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  overallFeedback: string;
  overallFeedbackVi: string;
  strengths: string[];
  strengthsVi: string[];
  improvements: string[];
  improvementsVi: string[];
  confidenceScore: number;
}

@Injectable()
export class AiGradingService extends BaseService<AiGradingsEntity> {
  private readonly defaultRubric: RubricCriterion[] = [
    { criterion: 'Correctness', criterionVi: 'Tính đúng đắn', maxScore: 40 },
    { criterion: 'Code Quality', criterionVi: 'Chất lượng code', maxScore: 20 },
    { criterion: 'Efficiency', criterionVi: 'Hiệu quả', maxScore: 20 },
    { criterion: 'Style & Readability', criterionVi: 'Style & Dễ đọc', maxScore: 10 },
    { criterion: 'Documentation', criterionVi: 'Tài liệu/Comment', maxScore: 10 },
  ];

  constructor(
    @InjectRepository(AiGradingsEntity)
    private readonly gradingRepository: Repository<AiGradingsEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {
    super(gradingRepository);
  }

  /**
   * Grade a submission using AI.
   */
  async gradeSubmission(
    submissionId: string,
    rubric?: RubricCriterion[],
    gradedBy?: string,
  ): Promise<AiGradingsEntity> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['problem'],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Use provided rubric or default
    const activeRubric = rubric || this.defaultRubric;

    // Analyze code and generate grades
    const result = await this.analyzeAndGrade(
      submission.sourceCode || '',
      submission.language,
      submission.problem?.description || '',
      activeRubric,
    );

    // Create grading entity
    const grading = this.gradingRepository.create({
      submissionId,
      ...result,
      aiProvider: 'system',
      aiModel: 'heuristic-v1',
      isVerified: false,
      gradedBy,
    });

    return this.gradingRepository.save(grading);
  }

  /**
   * Analyze code and generate grades based on rubric.
   */
  private async analyzeAndGrade(
    code: string,
    language: string,
    problemDescription: string,
    rubric: RubricCriterion[],
  ): Promise<GradingResult> {
    const rubricScores: GradingResult['rubricScores'] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Analyze code for each criterion
    for (const criterion of rubric) {
      maxPossibleScore += criterion.maxScore;
      
      const analysis = this.analyzeCriterion(criterion.criterion, code, language);
      
      const score = Math.round(criterion.maxScore * analysis.score);
      totalScore += score;

      rubricScores.push({
        criterion: criterion.criterion,
        criterionVi: criterion.criterionVi,
        maxScore: criterion.maxScore,
        score,
        feedback: analysis.feedback,
        feedbackVi: analysis.feedbackVi,
      });
    }

    const percentageScore = (totalScore / maxPossibleScore) * 100;

    // Generate overall assessment
    const { strengths, strengthsVi, improvements, improvementsVi } = 
      this.identifyStrengthsAndImprovements(rubricScores);

    const overallFeedback = this.generateOverallFeedback(percentageScore, strengths, improvements, 'en');
    const overallFeedbackVi = this.generateOverallFeedback(percentageScore, strengthsVi, improvementsVi, 'vi');

    // Calculate confidence based on code complexity
    const confidenceScore = this.calculateConfidence(code);

    return {
      rubricScores,
      totalScore,
      maxPossibleScore,
      percentageScore,
      overallFeedback,
      overallFeedbackVi,
      strengths,
      strengthsVi,
      improvements,
      improvementsVi,
      confidenceScore,
    };
  }

  /**
   * Analyze code for a specific criterion.
   */
  private analyzeCriterion(
    criterion: string,
    code: string,
    language: string,
  ): { score: number; feedback: string; feedbackVi: string } {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);

    switch (criterion.toLowerCase()) {
      case 'correctness':
        // Heuristic: check for common patterns
        const hasReturnOrPrint = /return|print|console\.|System\.out/i.test(code);
        const hasMainLogic = nonEmptyLines.length > 5;
        const score1 = (hasReturnOrPrint ? 0.5 : 0) + (hasMainLogic ? 0.5 : 0);
        return {
          score: score1,
          feedback: hasReturnOrPrint && hasMainLogic 
            ? 'Code appears to have proper output logic'
            : 'Code may be missing output or main logic',
          feedbackVi: hasReturnOrPrint && hasMainLogic
            ? 'Code có logic output hợp lý'
            : 'Code có thể thiếu output hoặc logic chính',
        };

      case 'code quality':
        // Check naming conventions, structure
        const hasGoodNaming = /[a-z][a-zA-Z]+|[a-z]+_[a-z]+/.test(code);
        const hasSmallFunctions = (code.match(/function|def |void |public |private /g) || []).length > 1;
        const score2 = (hasGoodNaming ? 0.5 : 0.3) + (hasSmallFunctions ? 0.5 : 0.2);
        return {
          score: Math.min(1, score2),
          feedback: hasGoodNaming 
            ? 'Good naming conventions used'
            : 'Consider using more descriptive variable names',
          feedbackVi: hasGoodNaming
            ? 'Đặt tên biến tốt'
            : 'Cân nhắc sử dụng tên biến mô tả hơn',
        };

      case 'efficiency':
        // Check for nested loops (potential O(n²))
        const nestedLoops = (code.match(/for.*for|while.*while/s) || []).length;
        const hasEarlyReturn = /return.*if|break|continue/.test(code);
        const score3 = nestedLoops > 1 ? 0.4 : nestedLoops === 1 ? 0.7 : 0.9;
        const adjustedScore3 = hasEarlyReturn ? Math.min(1, score3 + 0.1) : score3;
        return {
          score: adjustedScore3,
          feedback: nestedLoops > 1
            ? 'Multiple nested loops detected - consider optimization'
            : 'Code efficiency appears reasonable',
          feedbackVi: nestedLoops > 1
            ? 'Phát hiện nhiều vòng lặp lồng nhau - cân nhắc tối ưu'
            : 'Hiệu quả code hợp lý',
        };

      case 'style & readability':
        // Check indentation, line length, spacing
        const hasConsistentIndent = lines.every(l => 
          l.startsWith('  ') || l.startsWith('\t') || l.trim() === '' || l === l.trim()
        );
        const avgLineLength = nonEmptyLines.reduce((s, l) => s + l.length, 0) / Math.max(1, nonEmptyLines.length);
        const goodLineLength = avgLineLength < 100;
        const score4 = (hasConsistentIndent ? 0.5 : 0.3) + (goodLineLength ? 0.5 : 0.3);
        return {
          score: Math.min(1, score4),
          feedback: hasConsistentIndent && goodLineLength
            ? 'Good code formatting and readability'
            : 'Consider improving code formatting',
          feedbackVi: hasConsistentIndent && goodLineLength
            ? 'Format code và dễ đọc tốt'
            : 'Cân nhắc cải thiện format code',
        };

      case 'documentation':
        // Check for comments
        const commentPatterns = /\/\/|\/\*|#.*|"""|'''|<!--/;
        const hasComments = commentPatterns.test(code);
        const commentRatio = (code.match(commentPatterns) || []).length / Math.max(1, nonEmptyLines.length);
        const score5 = hasComments ? 0.5 + Math.min(0.5, commentRatio * 2) : 0.2;
        return {
          score: score5,
          feedback: hasComments
            ? 'Code includes documentation/comments'
            : 'Consider adding comments to explain complex logic',
          feedbackVi: hasComments
            ? 'Code có comment/tài liệu'
            : 'Cân nhắc thêm comment giải thích logic phức tạp',
        };

      default:
        return {
          score: 0.7,
          feedback: 'Adequate performance in this criterion',
          feedbackVi: 'Đạt yêu cầu cho tiêu chí này',
        };
    }
  }

  private identifyStrengthsAndImprovements(
    rubricScores: GradingResult['rubricScores'],
  ): {
    strengths: string[];
    strengthsVi: string[];
    improvements: string[];
    improvementsVi: string[];
  } {
    const strengths: string[] = [];
    const strengthsVi: string[] = [];
    const improvements: string[] = [];
    const improvementsVi: string[] = [];

    for (const item of rubricScores) {
      const percentage = (item.score / item.maxScore) * 100;
      
      if (percentage >= 80) {
        strengths.push(`Strong ${item.criterion.toLowerCase()}`);
        strengthsVi.push(`${item.criterionVi || item.criterion} tốt`);
      } else if (percentage < 60) {
        improvements.push(`Improve ${item.criterion.toLowerCase()}`);
        improvementsVi.push(`Cải thiện ${item.criterionVi || item.criterion}`);
      }
    }

    return { strengths, strengthsVi, improvements, improvementsVi };
  }

  private generateOverallFeedback(
    percentage: number,
    strengths: string[],
    improvements: string[],
    lang: 'en' | 'vi',
  ): string {
    if (lang === 'vi') {
      if (percentage >= 90) {
        return `Xuất sắc! Code của bạn đạt ${percentage.toFixed(1)}%. ${strengths.length > 0 ? `Điểm mạnh: ${strengths.join(', ')}.` : ''}`;
      } else if (percentage >= 70) {
        return `Tốt! Code đạt ${percentage.toFixed(1)}%. ${improvements.length > 0 ? `Có thể cải thiện: ${improvements.join(', ')}.` : ''}`;
      } else if (percentage >= 50) {
        return `Cần cải thiện. Code đạt ${percentage.toFixed(1)}%. Hãy tập trung vào: ${improvements.join(', ')}.`;
      } else {
        return `Cần nỗ lực thêm. Code đạt ${percentage.toFixed(1)}%. Xem lại các tiêu chí chấm điểm và cải thiện.`;
      }
    } else {
      if (percentage >= 90) {
        return `Excellent! Your code scores ${percentage.toFixed(1)}%. ${strengths.length > 0 ? `Strengths: ${strengths.join(', ')}.` : ''}`;
      } else if (percentage >= 70) {
        return `Good work! Score: ${percentage.toFixed(1)}%. ${improvements.length > 0 ? `Areas to improve: ${improvements.join(', ')}.` : ''}`;
      } else if (percentage >= 50) {
        return `Needs improvement. Score: ${percentage.toFixed(1)}%. Focus on: ${improvements.join(', ')}.`;
      } else {
        return `Needs significant work. Score: ${percentage.toFixed(1)}%. Review the rubric and improve.`;
      }
    }
  }

  private calculateConfidence(code: string): number {
    // Higher confidence for simpler, more analyzable code
    const lines = code.split('\n').filter(l => l.trim().length > 0);
    
    if (lines.length < 5) return 0.5; // Too short to analyze well
    if (lines.length > 500) return 0.6; // Very long code is harder to analyze
    
    // Moderate length code has higher confidence
    return 0.8;
  }

  /**
   * Verify/approve a grading.
   */
  async verifyGrading(
    gradingId: string,
    verifierId: string,
    overrideScore?: number,
    overrideFeedback?: string,
  ): Promise<AiGradingsEntity> {
    const updates: Partial<AiGradingsEntity> = {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    };

    if (overrideScore !== undefined) {
      updates.overrideScore = overrideScore;
    }
    if (overrideFeedback) {
      updates.overrideFeedback = overrideFeedback;
    }

    return this.update(gradingId, updates);
  }

  /**
   * Get grading for a submission.
   */
  async getGradingForSubmission(submissionId: string): Promise<AiGradingsEntity | null> {
    return this.gradingRepository.findOne({
      where: { submissionId },
      order: { createdAt: 'DESC' },
    });
  }
}
