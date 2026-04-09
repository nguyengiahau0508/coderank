import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ClassAnalyticsEntity } from '../entities/class-analytics.entity';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';
import { CoursesEntity } from 'src/modules/courses/entities/courses.entity';
import { SubmissionStatusEnum } from 'src/common/enums/enums';

@Injectable()
export class ClassAnalyticsService extends BaseService<ClassAnalyticsEntity> {
  constructor(
    @InjectRepository(ClassAnalyticsEntity)
    private readonly analyticsRepository: Repository<ClassAnalyticsEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
    @InjectRepository(CoursesEntity)
    private readonly coursesRepository: Repository<CoursesEntity>,
  ) {
    super(analyticsRepository);
  }

  /**
   * Generate analytics for a course over a period.
   */
  async generateAnalytics(
    courseId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<ClassAnalyticsEntity> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: [
        'author',
        'enrollments',
        'sections',
        'sections.lessons',
        'sections.lessons.problems',
      ],
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Get all submissions in this period for course problems
    const problemIds = Array.from(
      new Set(
        (course.sections || []).flatMap((section) =>
          (section.lessons || []).flatMap((lesson) =>
            (lesson.problems || []).map(
              (lessonProblem) => lessonProblem.problemId,
            ),
          ),
        ),
      ),
    );

    if (problemIds.length === 0) {
      return this.createEmptyAnalytics(
        courseId,
        course.authorId,
        periodStart,
        periodEnd,
      );
    }

    const submissions = await this.submissionsRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.problem', 'problem')
      .leftJoinAndSelect('problem.tags', 'tags')
      .where('sub.problemId IN (:...problemIds)', { problemIds })
      .andWhere('sub.createdAt BETWEEN :start AND :end', {
        start: periodStart,
        end: periodEnd,
      })
      .getMany();

    // Calculate metrics
    const totalStudents = course.enrollments?.length || 0;
    const studentSubmissions = new Set(
      submissions
        .map((s) => s.authorId)
        .filter((authorId): authorId is string => Boolean(authorId)),
    );
    const activeStudents = studentSubmissions.size;

    const acceptedSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatusEnum.Accepted,
    );

    // Problem solve counts
    const problemSolves = new Map<string, Set<string>>();
    for (const sub of acceptedSubmissions) {
      if (!problemSolves.has(sub.problemId)) {
        problemSolves.set(sub.problemId, new Set());
      }
      if (sub.authorId) {
        problemSolves.get(sub.problemId)!.add(sub.authorId);
      }
    }

    const problemsWithZeroSolves = problemIds.filter(
      (pid) => !problemSolves.has(pid) || problemSolves.get(pid)!.size === 0,
    ).length;

    // Calculate topic performance
    const topicStats = new Map<
      string,
      { total: number; accepted: number; attempts: number }
    >();
    for (const sub of submissions) {
      const tags = sub.problem?.tags || [];
      for (const tag of tags) {
        if (!topicStats.has(tag.name)) {
          topicStats.set(tag.name, { total: 0, accepted: 0, attempts: 0 });
        }
        const stat = topicStats.get(tag.name)!;
        stat.total++;
        stat.attempts++;
        if (sub.status === SubmissionStatusEnum.Accepted) {
          stat.accepted++;
        }
      }
    }

    const topicPerformance: Record<string, any> = {};
    for (const [topic, stats] of topicStats) {
      topicPerformance[topic] = {
        totalProblems: stats.total,
        averageAcceptance:
          stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
        averageAttempts: stats.attempts / Math.max(1, stats.total),
      };
    }

    // Identify common mistakes
    const errorSubmissions = submissions.filter(
      (s) =>
        s.status !== SubmissionStatusEnum.Accepted &&
        s.status !== SubmissionStatusEnum.Pending,
    );

    const mistakeCounts = new Map<string, number>();
    for (const sub of errorSubmissions) {
      const status = sub.status || 'unknown';
      mistakeCounts.set(status, (mistakeCounts.get(status) || 0) + 1);
    }

    const commonMistakes = Array.from(mistakeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, frequency]) => ({
        category,
        description: this.getMistakeDescription(category),
        frequency,
        affectedStudents: new Set(
          errorSubmissions
            .filter((s) => s.status === category)
            .map((s) => s.authorId)
            .filter((authorId): authorId is string => Boolean(authorId)),
        ).size,
      }));

    // Identify struggling topics
    const strugglingTopics = Object.entries(topicPerformance)
      .filter(([_, perf]: any) => perf.averageAcceptance < 50)
      .sort((a: any, b: any) => a[1].averageAcceptance - b[1].averageAcceptance)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Generate AI insights
    const aiInsights = this.generateInsights(
      totalStudents,
      activeStudents,
      acceptedSubmissions.length / Math.max(1, submissions.length),
      strugglingTopics,
      commonMistakes,
    );

    // Calculate average progress
    const solvedPerStudent = new Map<string, number>();
    for (const sub of acceptedSubmissions) {
      if (sub.authorId) {
        solvedPerStudent.set(
          sub.authorId,
          (solvedPerStudent.get(sub.authorId) || 0) + 1,
        );
      }
    }

    const avgProgress =
      activeStudents > 0
        ? (Array.from(solvedPerStudent.values()).reduce((a, b) => a + b, 0) /
            (activeStudents * Math.max(1, problemIds.length))) *
          100
        : 0;

    // Create analytics entity
    const analytics = this.analyticsRepository.create({
      courseId,
      instructorId: course.authorId || undefined,
      periodStart,
      periodEnd,
      totalStudents,
      activeStudents,
      averageProgress: avgProgress,
      totalSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      overallAcceptanceRate:
        submissions.length > 0
          ? (acceptedSubmissions.length / submissions.length) * 100
          : 0,
      averageAttemptsPerProblem:
        submissions.length / Math.max(1, problemIds.length),
      totalProblemsAssigned: problemIds.length,
      problemsWithZeroSolves,
      topicPerformance,
      commonMistakes,
      strugglingTopics,
      aiInsights,
      generatedAt: new Date(),
    });

    return this.analyticsRepository.save(analytics);
  }

  private createEmptyAnalytics(
    courseId: string,
    instructorId: string | null | undefined,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<ClassAnalyticsEntity> {
    const analytics = this.analyticsRepository.create({
      courseId,
      instructorId: instructorId || undefined,
      periodStart,
      periodEnd,
      totalStudents: 0,
      activeStudents: 0,
      aiInsights: {
        summary: 'No data available for this period.',
        summaryVi: 'Không có dữ liệu trong khoảng thời gian này.',
        recommendations: [],
        recommendationsVi: [],
        alerts: [],
        alertsVi: [],
      },
      generatedAt: new Date(),
    });

    return this.analyticsRepository.save(analytics);
  }

  private getMistakeDescription(category: string): string {
    const descriptions: Record<string, string> = {
      [SubmissionStatusEnum.WrongAnswer]:
        'Output does not match expected result',
      [SubmissionStatusEnum.TimeLimitExceeded]: 'Program runs too slowly',
      [SubmissionStatusEnum.MemoryLimitExceeded]:
        'Program uses too much memory',
      [SubmissionStatusEnum.RuntimeError]: 'Program crashed during execution',
      [SubmissionStatusEnum.CompilationError]: 'Code failed to compile',
    };
    return descriptions[category] || 'Unknown error type';
  }

  private generateInsights(
    totalStudents: number,
    activeStudents: number,
    acceptanceRate: number,
    strugglingTopics: string[],
    commonMistakes: any[],
  ) {
    const insights = {
      summary: '',
      summaryVi: '',
      recommendations: [] as string[],
      recommendationsVi: [] as string[],
      alerts: [] as string[],
      alertsVi: [] as string[],
    };

    // Participation rate analysis
    const participationRate =
      totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    if (participationRate < 50) {
      insights.alerts.push(
        'Low student participation - less than 50% of students have submitted',
      );
      insights.alertsVi.push(
        'Tỷ lệ tham gia thấp - dưới 50% sinh viên đã nộp bài',
      );
      insights.recommendations.push(
        'Consider sending reminders or reviewing assignment difficulty',
      );
      insights.recommendationsVi.push(
        'Cân nhắc gửi nhắc nhở hoặc xem lại độ khó bài tập',
      );
    }

    // Acceptance rate analysis
    if (acceptanceRate < 0.3) {
      insights.alerts.push(
        'Low acceptance rate - students are struggling with problems',
      );
      insights.alertsVi.push(
        'Tỷ lệ đúng thấp - sinh viên đang gặp khó khăn với các bài tập',
      );
      insights.recommendations.push(
        'Consider providing more hints or reviewing problem difficulty',
      );
      insights.recommendationsVi.push(
        'Cân nhắc cung cấp thêm gợi ý hoặc xem lại độ khó',
      );
    }

    // Topic analysis
    if (strugglingTopics.length > 0) {
      insights.alerts.push(
        `Students struggling with: ${strugglingTopics.join(', ')}`,
      );
      insights.alertsVi.push(
        `Sinh viên gặp khó với: ${strugglingTopics.join(', ')}`,
      );
      insights.recommendations.push(
        'Consider additional teaching materials for these topics',
      );
      insights.recommendationsVi.push(
        'Cân nhắc cung cấp thêm tài liệu cho các chủ đề này',
      );
    }

    // Common mistakes analysis
    if (commonMistakes.length > 0) {
      const topMistake = commonMistakes[0];
      insights.alerts.push(
        `Most common error: ${topMistake.category} (${topMistake.frequency} occurrences)`,
      );
      insights.alertsVi.push(
        `Lỗi phổ biến nhất: ${topMistake.category} (${topMistake.frequency} lần)`,
      );
    }

    // Summary
    insights.summary =
      `${activeStudents}/${totalStudents} students active. ` +
      `${(acceptanceRate * 100).toFixed(1)}% acceptance rate. ` +
      `${strugglingTopics.length} topics need attention.`;

    insights.summaryVi =
      `${activeStudents}/${totalStudents} sinh viên hoạt động. ` +
      `Tỷ lệ đúng ${(acceptanceRate * 100).toFixed(1)}%. ` +
      `${strugglingTopics.length} chủ đề cần chú ý.`;

    return insights;
  }

  /**
   * Get latest analytics for a course.
   */
  async getLatestAnalytics(
    courseId: string,
  ): Promise<ClassAnalyticsEntity | null> {
    return this.analyticsRepository.findOne({
      where: { courseId },
      order: { generatedAt: 'DESC' },
    });
  }

  /**
   * Get analytics history for a course.
   */
  async getAnalyticsHistory(
    courseId: string,
    limit: number = 10,
  ): Promise<ClassAnalyticsEntity[]> {
    return this.analyticsRepository.find({
      where: { courseId },
      order: { generatedAt: 'DESC' },
      take: limit,
    });
  }
}
