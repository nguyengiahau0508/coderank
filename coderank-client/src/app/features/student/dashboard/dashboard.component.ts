import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';

import { StudentCoursesService } from '../courses/services/courses.service';
import { StudentContestsService } from '../contests/services/contests.service';
import { UsersApi } from '../../../data';
import {
  ContestParticipantsModel,
  ContestStatusEnum,
  ContestsModel,
  CourseLevelEnum,
  CoursesModel,
  EnrollmentStatusEnum,
  UsersModel,
} from '../../../data';

interface ContestParticipationView {
  contest: ContestsModel;
  participation: ContestParticipantsModel;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, RouterLink, Button, Tag, Skeleton],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  private readonly coursesService = inject(StudentCoursesService);
  private readonly contestsService = inject(StudentContestsService);
  private readonly usersApi = inject(UsersApi);

  readonly loading = signal<boolean>(true);
  readonly profile = signal<UsersModel | null>(null);
  readonly enrolledCourses = signal<CoursesModel[]>([]);
  readonly recentCourses = signal<CoursesModel[]>([]);
  readonly recentParticipations = signal<ContestParticipationView[]>([]);
  readonly spotlightContests = signal<ContestsModel[]>([]);

  readonly quickActions: QuickAction[] = [
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

  readonly courseStats = computed(() => {
    const courses = this.enrolledCourses();
    const total = courses.length;
    const inProgress = courses.filter(
      c => c.enrollment?.status === EnrollmentStatusEnum.Active,
    ).length;
    const completed = courses.filter(
      c => c.enrollment?.status === EnrollmentStatusEnum.Completed,
    ).length;

    const totalProgress = courses.reduce(
      (acc, c) => acc + (c.enrollment?.progressPercent || 0),
      0,
    );
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {
      total,
      inProgress,
      completed,
      avgProgress,
    };
  });

  readonly contestStats = computed(() => {
    const participations = this.recentParticipations();
    const totalJoined = participations.length;
    const bestRank = participations.reduce<number>(
      (best, item) => {
        if (!item.participation.rank) {
          return best;
        }
        return Math.min(best, item.participation.rank);
      },
      Number.MAX_SAFE_INTEGER,
    );

    const rankSamples = participations
      .map(item => item.participation.rank)
      .filter((rank): rank is number => typeof rank === 'number' && rank > 0);

    const averageRank =
      rankSamples.length > 0
        ? Number(
            (
              rankSamples.reduce((sum, rank) => sum + rank, 0) /
              rankSamples.length
            ).toFixed(1),
          )
        : null;

    const totalScore = participations.reduce(
      (sum, item) => sum + (item.participation.totalScore || 0),
      0,
    );

    return {
      totalJoined,
      bestRank:
        bestRank === Number.MAX_SAFE_INTEGER ? null : bestRank,
      averageRank,
      totalScore,
    };
  });

  readonly learnerTier = computed(() => {
    const elo = Number(this.profile()?.eloRating || 1400);
    if (elo >= 2200) {
      return 'Legend';
    }
    if (elo >= 1900) {
      return 'Master';
    }
    if (elo >= 1650) {
      return 'Advanced';
    }
    if (elo >= 1400) {
      return 'Intermediate';
    }
    return 'Beginner';
  });

  readonly learnerTierColor = computed(() => {
    const tier = this.learnerTier();
    if (tier === 'Legend') {
      return 'background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: #fff;';
    }
    if (tier === 'Master') {
      return 'background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #fff;';
    }
    if (tier === 'Advanced') {
      return 'background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff;';
    }
    if (tier === 'Intermediate') {
      return 'background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #fff;';
    }
    return 'background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: #fff;';
  });

  readonly greeting = computed(() => {
    const fullName = this.profile()?.fullName?.trim();
    if (fullName) {
      return fullName;
    }
    return this.profile()?.username || 'Student';
  });

  ngOnInit(): void {
    void this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    this.loading.set(true);

    try {
      const [profileResponse, coursesResponse, endedContestsResponse, runningContestsResponse, upcomingContestsResponse] =
        await Promise.all([
          firstValueFrom(this.usersApi.getProfile()),
          firstValueFrom(
            this.coursesService.getEnrolledCourses({
              page: 1,
              limit: 30,
              sortBy: 'lastAccessedAt',
              sortOrder: 'DESC',
            }),
          ),
          firstValueFrom(
            this.contestsService.getContests({
              page: 1,
              limit: 12,
              status: ContestStatusEnum.Ended,
              isPublic: true,
            }),
          ),
          firstValueFrom(
            this.contestsService.getContests({
              page: 1,
              limit: 4,
              status: ContestStatusEnum.Running,
              isPublic: true,
            }),
          ),
          firstValueFrom(
            this.contestsService.getContests({
              page: 1,
              limit: 4,
              status: ContestStatusEnum.Upcoming,
              isPublic: true,
            }),
          ),
        ]);

      const profile = profileResponse.data || null;
      const courses = coursesResponse.data || [];
      const endedContests = endedContestsResponse.data || [];
      const runningContests = runningContestsResponse.data || [];
      const upcomingContests = upcomingContestsResponse.data || [];

      this.profile.set(profile);
      this.enrolledCourses.set(courses);
      this.recentCourses.set(courses.slice(0, 5));

      const participationChecks = endedContests.map(async contest => {
        try {
          const result = await firstValueFrom(
            this.contestsService.getMyParticipation(String(contest.id)),
          );
          return {
            contest,
            participation: result.data,
          };
        } catch {
          return {
            contest,
            participation: null,
          };
        }
      });

      const participationResults = await Promise.all(participationChecks);

      this.recentParticipations.set(
        participationResults
          .filter(
            (
              item,
            ): item is ContestParticipationView => !!item.participation,
          )
          .slice(0, 6),
      );

      this.spotlightContests.set(
        [...runningContests, ...upcomingContests].slice(0, 4),
      );
    } finally {
      this.loading.set(false);
    }
  }

  getCourseLevelLabel(level: CourseLevelEnum): string {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'Cơ bản';
      case CourseLevelEnum.Intermediate:
        return 'Trung cấp';
      case CourseLevelEnum.Advanced:
        return 'Nâng cao';
      default:
        return level;
    }
  }

  getCourseLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'success';
      case CourseLevelEnum.Intermediate:
        return 'info';
      case CourseLevelEnum.Advanced:
        return 'warn';
      default:
        return 'info';
    }
  }

  getContestStatusLabel(status: ContestStatusEnum): string {
    return this.contestsService.getStatusLabel(status);
  }

  getContestStatusSeverity(
    status: ContestStatusEnum,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.contestsService.getStatusSeverity(status);
  }

  formatDate(dateInput?: string | Date | null): string {
    if (!dateInput) {
      return '—';
    }

    const date = new Date(dateInput);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
