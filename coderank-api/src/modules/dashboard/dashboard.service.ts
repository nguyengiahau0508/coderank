import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ContestStatusEnum,
  CourseLevelEnum,
  EnrollmentStatusEnum,
} from 'src/common/enums/enums';
import { UsersEntity } from '../users/entities/user.entity';
import { CourseEnrollmentsEntity } from '../courses/entities/course-enrollments.entity';
import { ContestsEntity } from '../contests/entities/contests.entity';
import { ContestParticipantsEntity } from '../contests/entities/contest-participants.entity';
import { UserSkillProfilesService } from '../ai-features/services/user-skill-profiles.service';
import { LearningPathsService } from '../ai-features/services/learning-paths.service';

type LearnerTier =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Master'
  | 'Legend';

export interface DashboardQuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

export interface DashboardResponse {
  profile: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    eloRating: number;
    tier: LearnerTier;
  };
  learning: {
    totalCourses: number;
    inProgress: number;
    completed: number;
    avgProgress: number;
    recentCourses: Array<{
      id: string;
      title: string;
      level: CourseLevelEnum;
      thumbnailUrl?: string;
      enrollment: {
        id: string;
        status: EnrollmentStatusEnum;
        enrolledAt?: Date;
        completedAt?: Date;
        progressPercent: number;
        completedLessons: number;
        totalLessons: number;
        lastAccessedAt?: Date;
        certificateIssuedAt?: Date;
      };
    }>;
  };
  contests: {
    totalJoined: number;
    bestRank?: number;
    averageRank?: number;
    totalScore: number;
    recentParticipations: Array<{
      contestId: string;
      title: string;
      endTime: Date;
      rank?: number;
      totalScore: number;
    }>;
    spotlightContests: Array<{
      id: string;
      title: string;
      status: ContestStatusEnum;
      startTime: Date;
      endTime: Date;
    }>;
  };
  recommendations: {
    problems: Array<{
      id: string;
      title: string;
      slug: string;
      difficulty: string;
      points: number;
    }>;
    activeLearningPath: {
      id: string;
      title: string;
      goalTopic: string;
      targetLevel: string;
      progressPercent: number;
      currentStepIndex: number;
      totalSteps: number;
      status: string;
    } | null;
    quickActions: DashboardQuickAction[];
  };
  meta: {
    generatedAt: string;
    partialFailures: string[];
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(CourseEnrollmentsEntity)
    private readonly enrollmentsRepository: Repository<CourseEnrollmentsEntity>,
    @InjectRepository(ContestsEntity)
    private readonly contestsRepository: Repository<ContestsEntity>,
    @InjectRepository(ContestParticipantsEntity)
    private readonly participantsRepository: Repository<ContestParticipantsEntity>,
    private readonly skillProfilesService: UserSkillProfilesService,
    private readonly learningPathsService: LearningPathsService,
  ) {}

  async getStudentDashboard(userId: string): Promise<DashboardResponse> {
    const partialFailures: string[] = [];
    const profile = await this.loadProfile(userId);

    const learning = await this.loadLearningSection(userId, partialFailures);
    const contests = await this.loadContestSection(userId, partialFailures);
    const recommendations = await this.loadRecommendationSection(
      userId,
      partialFailures,
    );

    return {
      profile,
      learning,
      contests,
      recommendations,
      meta: {
        generatedAt: new Date().toISOString(),
        partialFailures,
      },
    };
  }

  private async loadProfile(
    userId: string,
  ): Promise<DashboardResponse['profile']> {
    const profile = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'fullName', 'username', 'avatarUrl', 'eloRating'],
    });

    if (!profile) {
      return {
        id: userId,
        fullName: 'Student',
        username: 'student',
        avatarUrl: undefined,
        eloRating: 1400,
        tier: 'Intermediate',
      };
    }

    return {
      id: profile.id,
      fullName: profile.fullName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      eloRating: Number(profile.eloRating || 1400),
      tier: this.getLearnerTier(Number(profile.eloRating || 1400)),
    };
  }

  private async loadLearningSection(
    userId: string,
    partialFailures: string[],
  ): Promise<DashboardResponse['learning']> {
    try {
      const enrollments = await this.enrollmentsRepository.find({
        where: {
          userId,
          status: In([
            EnrollmentStatusEnum.Active,
            EnrollmentStatusEnum.Completed,
          ]),
        },
        relations: { course: true },
        order: { enrolledAt: 'DESC' },
        take: 10,
      });

      const totalCourses = enrollments.length;
      const inProgress = enrollments.filter(
        (item) => item.status === EnrollmentStatusEnum.Active,
      ).length;
      const completed = enrollments.filter(
        (item) => item.status === EnrollmentStatusEnum.Completed,
      ).length;
      const avgProgress =
        totalCourses > 0
          ? Math.round(
              enrollments.reduce(
                (sum, item) => sum + Number(item.progressPercent || 0),
                0,
              ) / totalCourses,
            )
          : 0;

      return {
        totalCourses,
        inProgress,
        completed,
        avgProgress,
        recentCourses: enrollments.slice(0, 5).map((item) => ({
          id: item.course.id,
          title: item.course.title,
          level: item.course.level,
          thumbnailUrl: item.course.thumbnailUrl,
          enrollment: {
            id: item.id,
            status: item.status,
            enrolledAt: item.enrolledAt,
            completedAt: item.completedAt,
            progressPercent: Number(item.progressPercent || 0),
            completedLessons: item.completedLessons || 0,
            totalLessons: item.totalLessons || 0,
            lastAccessedAt: item.lastAccessedAt,
            certificateIssuedAt: item.certificateIssuedAt,
          },
        })),
      };
    } catch {
      partialFailures.push('learning');
      return {
        totalCourses: 0,
        inProgress: 0,
        completed: 0,
        avgProgress: 0,
        recentCourses: [],
      };
    }
  }

  private async loadContestSection(
    userId: string,
    partialFailures: string[],
  ): Promise<DashboardResponse['contests']> {
    try {
      const participations = await this.participantsRepository
        .createQueryBuilder('participant')
        .leftJoinAndSelect('participant.contest', 'contest')
        .where('participant.userId = :userId', { userId })
        .andWhere('contest.status = :status', {
          status: ContestStatusEnum.Ended,
        })
        .orderBy('contest.endTime', 'DESC')
        .limit(6)
        .getMany();

      const totalJoined = participations.length;
      const ranks = participations
        .map((item) => item.rank)
        .filter((rank): rank is number => typeof rank === 'number' && rank > 0);
      const bestRank = ranks.length > 0 ? Math.min(...ranks) : undefined;
      const averageRank =
        ranks.length > 0
          ? Number(
              (
                ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
              ).toFixed(1),
            )
          : undefined;
      const totalScore = participations.reduce(
        (sum, item) => sum + Number(item.totalScore || 0),
        0,
      );

      const spotlightContests = await this.contestsRepository
        .createQueryBuilder('contest')
        .where('contest.isPublic = :isPublic', { isPublic: true })
        .andWhere('contest.status IN (:...statuses)', {
          statuses: [ContestStatusEnum.Running, ContestStatusEnum.Upcoming],
        })
        .orderBy('CASE WHEN contest.status = :running THEN 0 ELSE 1 END', 'ASC')
        .addOrderBy('contest.startTime', 'ASC')
        .setParameter('running', ContestStatusEnum.Running)
        .limit(4)
        .getMany();

      return {
        totalJoined,
        bestRank,
        averageRank,
        totalScore,
        recentParticipations: participations.map((item) => ({
          contestId: item.contest.id,
          title: item.contest.title,
          endTime: item.contest.endTime,
          rank: item.rank,
          totalScore: Number(item.totalScore || 0),
        })),
        spotlightContests: spotlightContests.map((contest) => ({
          id: contest.id,
          title: contest.title,
          status: contest.status,
          startTime: contest.startTime,
          endTime: contest.endTime,
        })),
      };
    } catch {
      partialFailures.push('contests');
      return {
        totalJoined: 0,
        bestRank: undefined,
        averageRank: undefined,
        totalScore: 0,
        recentParticipations: [],
        spotlightContests: [],
      };
    }
  }

  private async loadRecommendationSection(
    userId: string,
    partialFailures: string[],
  ): Promise<DashboardResponse['recommendations']> {
    const quickActions: DashboardQuickAction[] = [
      {
        label: 'Luyện đề',
        description: 'Giải bài và tăng tốc kỹ năng',
        icon: 'pi pi-code',
        route: '/student/problems',
      },
      {
        label: 'Khóa học của tôi',
        description: 'Tiếp tục học theo lộ trình',
        icon: 'pi pi-book',
        route: '/student/courses/my-courses',
      },
      {
        label: 'Tất cả cuộc thi',
        description: 'Theo dõi contest mới nhất',
        icon: 'pi pi-trophy',
        route: '/student/contests',
      },
    ];

    try {
      const [problems, activeLearningPath] = await Promise.all([
        this.skillProfilesService.getRecommendedProblems(userId, 6),
        this.learningPathsService.getActiveLearningPath(userId),
      ]);

      return {
        problems: problems.map((problem) => ({
          id: problem.id,
          title: problem.title,
          slug: problem.slug,
          difficulty: problem.difficulty,
          points: problem.points,
        })),
        activeLearningPath: activeLearningPath
          ? {
              id: activeLearningPath.id,
              title: activeLearningPath.title,
              goalTopic: activeLearningPath.goalTopic,
              targetLevel: activeLearningPath.targetLevel,
              progressPercent: Number(activeLearningPath.progressPercent || 0),
              currentStepIndex: activeLearningPath.currentStepIndex,
              totalSteps: activeLearningPath.totalSteps,
              status: activeLearningPath.status,
            }
          : null,
        quickActions,
      };
    } catch {
      partialFailures.push('recommendations');
      return {
        problems: [],
        activeLearningPath: null,
        quickActions,
      };
    }
  }

  private getLearnerTier(eloRating: number): LearnerTier {
    if (eloRating >= 2200) {
      return 'Legend';
    }
    if (eloRating >= 1900) {
      return 'Master';
    }
    if (eloRating >= 1650) {
      return 'Advanced';
    }
    if (eloRating >= 1400) {
      return 'Intermediate';
    }
    return 'Beginner';
  }
}
