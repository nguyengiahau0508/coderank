import {
  ContestStatusEnum,
  CourseLevelEnum,
  EnrollmentStatusEnum,
} from '../../../shared';

export interface StudentDashboardQuickActionModel {
  label: string;
  description: string;
  icon: string;
  route: string;
}

export interface StudentDashboardProfileModel {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  eloRating: number;
  tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | 'Legend';
}

export interface StudentDashboardCourseModel {
  id: string;
  title: string;
  level: CourseLevelEnum;
  thumbnailUrl?: string;
  enrollment: {
    id: string;
    status: EnrollmentStatusEnum;
    enrolledAt?: string;
    completedAt?: string;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt?: string;
    certificateIssuedAt?: string;
  };
}

export interface StudentDashboardContestParticipationModel {
  contestId: string;
  title: string;
  endTime: string;
  rank?: number;
  totalScore: number;
}

export interface StudentDashboardSpotlightContestModel {
  id: string;
  title: string;
  status: ContestStatusEnum;
  startTime: string;
  endTime: string;
}

export interface StudentDashboardRecommendationProblemModel {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  points: number;
}

export interface StudentDashboardActiveLearningPathModel {
  id: string;
  title: string;
  goalTopic: string;
  targetLevel: string;
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  status: string;
}

export interface StudentDashboardModel {
  profile: StudentDashboardProfileModel;
  learning: {
    totalCourses: number;
    inProgress: number;
    completed: number;
    avgProgress: number;
    recentCourses: StudentDashboardCourseModel[];
  };
  contests: {
    totalJoined: number;
    bestRank?: number;
    averageRank?: number;
    totalScore: number;
    recentParticipations: StudentDashboardContestParticipationModel[];
    spotlightContests: StudentDashboardSpotlightContestModel[];
  };
  recommendations: {
    problems: StudentDashboardRecommendationProblemModel[];
    activeLearningPath: StudentDashboardActiveLearningPathModel | null;
    quickActions: StudentDashboardQuickActionModel[];
  };
  meta: {
    generatedAt: string;
    partialFailures: string[];
  };
}
