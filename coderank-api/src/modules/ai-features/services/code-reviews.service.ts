import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { CodeReviewsEntity } from '../entities/code-reviews.entity';
import { CodeReviewStatusEnum } from 'src/common/enums/enums';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';

interface CodeReviewResult {
  overallScore: number;
  readabilityScore: number;
  maintainabilityScore: number;
  efficiencyScore: number;
  bestPracticesScore: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    line?: number;
    message: string;
    rule: string;
    suggestion?: string;
  }>;
  suggestions: string[];
  summary: string;
  summaryVi: string;
}

@Injectable()
export class CodeReviewsService extends BaseService<CodeReviewsEntity> {
  constructor(
    @InjectRepository(CodeReviewsEntity)
    private readonly codeReviewsRepository: Repository<CodeReviewsEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {
    super(codeReviewsRepository);
  }

  /**
   * Get review for a submission.
   */
  async getReviewForSubmission(submissionId: string) {
    return this.codeReviewsRepository.findOne({
      where: { submissionId, status: CodeReviewStatusEnum.Completed },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Request a code review for a submission.
   */
  async requestReview(submissionId: string, lang: 'vi' | 'en' = 'vi') {
    // Check if review already exists
    const existingReview = await this.codeReviewsRepository.findOne({
      where: { submissionId, status: CodeReviewStatusEnum.Completed },
    });

    if (existingReview) {
      return existingReview;
    }

    // Get submission
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      select: ['id', 'code', 'language'],
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    const startTime = Date.now();

    // Create pending review
    const review = this.codeReviewsRepository.create({
      submissionId,
      status: CodeReviewStatusEnum.Pending,
    });
    await this.codeReviewsRepository.save(review);

    try {
      // Perform code review (would call AI agent in real implementation)
      const result = await this.analyzeCode(submission.code, submission.language, lang);

      // Update review with results
      review.status = CodeReviewStatusEnum.Completed;
      review.overallScore = result.overallScore;
      review.readabilityScore = result.readabilityScore;
      review.maintainabilityScore = result.maintainabilityScore;
      review.efficiencyScore = result.efficiencyScore;
      review.bestPracticesScore = result.bestPracticesScore;
      review.timeComplexity = result.timeComplexity;
      review.spaceComplexity = result.spaceComplexity;
      review.issues = result.issues;
      review.suggestions = result.suggestions;
      review.summary = result.summary;
      review.summaryVi = result.summaryVi;
      review.processingTimeMs = Date.now() - startTime;
      review.reviewedBy = 'system'; // Will be actual provider

      await this.codeReviewsRepository.save(review);

      return review;
    } catch (error) {
      review.status = CodeReviewStatusEnum.Failed;
      await this.codeReviewsRepository.save(review);
      throw error;
    }
  }

  /**
   * Analyze code and generate review.
   * In production, this would call the AI agent.
   */
  private async analyzeCode(
    code: string,
    language: string,
    _lang: 'vi' | 'en',
  ): Promise<CodeReviewResult> {
    // Basic heuristic analysis (would be replaced by AI)
    const lines = code.split('\n');
    const linesOfCode = lines.filter(l => l.trim().length > 0).length;
    
    const issues: CodeReviewResult['issues'] = [];
    const suggestions: string[] = [];

    // Check for common issues
    if (code.includes('var ')) {
      issues.push({
        severity: 'warning',
        message: 'Using var instead of let/const',
        rule: 'no-var',
        suggestion: 'Use const for constants and let for variables',
      });
    }

    if (code.includes('==') && !code.includes('===')) {
      issues.push({
        severity: 'warning',
        message: 'Using loose equality',
        rule: 'eqeqeq',
        suggestion: 'Use === for strict equality comparison',
      });
    }

    // Check line length
    const longLines = lines.filter(l => l.length > 100);
    if (longLines.length > 0) {
      issues.push({
        severity: 'info',
        message: `${longLines.length} line(s) exceed 100 characters`,
        rule: 'max-line-length',
      });
      suggestions.push('Break long lines for better readability');
    }

    // Calculate scores
    let readabilityScore = 80;
    let maintainabilityScore = 75;
    let efficiencyScore = 70;
    let bestPracticesScore = 75;

    // Deduct for issues
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    readabilityScore -= errorCount * 10 + warningCount * 5;
    bestPracticesScore -= errorCount * 10 + warningCount * 5;

    // Ensure scores are within bounds
    readabilityScore = Math.max(0, Math.min(100, readabilityScore));
    maintainabilityScore = Math.max(0, Math.min(100, maintainabilityScore));
    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));
    bestPracticesScore = Math.max(0, Math.min(100, bestPracticesScore));

    const overallScore = Math.round(
      (readabilityScore + maintainabilityScore + efficiencyScore + bestPracticesScore) / 4
    );

    // Estimate complexity (simplified)
    const hasNestedLoops = /for.*for|while.*while|for.*while/.test(code);
    const timeComplexity = hasNestedLoops ? 'O(n²)' : 'O(n)';
    const spaceComplexity = 'O(n)';

    return {
      overallScore,
      readabilityScore,
      maintainabilityScore,
      efficiencyScore,
      bestPracticesScore,
      timeComplexity,
      spaceComplexity,
      issues,
      suggestions,
      summary: `Code review completed. Overall score: ${overallScore}/100. Found ${issues.length} issue(s).`,
      summaryVi: `Đã hoàn thành review code. Điểm tổng: ${overallScore}/100. Tìm thấy ${issues.length} vấn đề.`,
    };
  }

  /**
   * Get review statistics for a user.
   */
  async getUserReviewStats(userId: string) {
    const reviews = await this.codeReviewsRepository
      .createQueryBuilder('review')
      .innerJoin('review.submission', 'submission')
      .where('submission.authorId = :userId', { userId })
      .andWhere('review.status = :status', { status: CodeReviewStatusEnum.Completed })
      .select([
        'AVG(review.overallScore) as avgOverall',
        'AVG(review.readabilityScore) as avgReadability',
        'AVG(review.maintainabilityScore) as avgMaintainability',
        'AVG(review.efficiencyScore) as avgEfficiency',
        'AVG(review.bestPracticesScore) as avgBestPractices',
        'COUNT(*) as totalReviews',
      ])
      .getRawOne();

    return {
      averageOverallScore: Math.round(reviews?.avgOverall || 0),
      averageReadabilityScore: Math.round(reviews?.avgReadability || 0),
      averageMaintainabilityScore: Math.round(reviews?.avgMaintainability || 0),
      averageEfficiencyScore: Math.round(reviews?.avgEfficiency || 0),
      averageBestPracticesScore: Math.round(reviews?.avgBestPractices || 0),
      totalReviews: parseInt(reviews?.totalReviews || '0', 10),
    };
  }
}
