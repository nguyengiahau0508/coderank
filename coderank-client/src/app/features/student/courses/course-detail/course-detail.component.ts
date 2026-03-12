import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

// Models & Enums
import {
  CoursesModel,
  CourseEnrollmentsModel,
  CourseReviewsModel,
  CourseProgressSummary,
} from '../../../../data';
import { CourseLevelEnum, CourseStatusEnum, LessonTypeEnum, EnrollmentStatusEnum } from '../../../../data';

// Services
import { StudentCoursesService } from '../services/courses.service';

@Component({
  selector: 'app-student-course-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Tag,
    Toast,
    Dialog,
    Tooltip,
    InputText,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Textarea,
  ],
  providers: [MessageService],
  templateUrl: './course-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly messageService = inject(MessageService);

  // State
  readonly course = signal<CoursesModel | null>(null);
  readonly loading = signal<boolean>(true);
  readonly courseId = signal<string>('');
  readonly activeTab = signal<string>('intro');

  // Enrollment
  readonly enrollment = signal<CourseEnrollmentsModel | null>(null);
  readonly enrolling = signal<boolean>(false);
  readonly isEnrolled = computed(() => {
    const e = this.enrollment();
    return !!e && e.status === EnrollmentStatusEnum.Active;
  });

  // Progress
  readonly progress = signal<CourseProgressSummary | null>(null);

  // Reviews
  readonly reviews = signal<CourseReviewsModel[]>([]);
  readonly showReviewDialog = signal<boolean>(false);
  reviewRating = 5;
  reviewComment = '';

  // Password enrollment dialog
  readonly showPasswordDialog = signal<boolean>(false);
  enrollPassword = '';

  // Computed
  readonly parsedLearningObjectives = computed(() => {
    const c = this.course();
    if (!c?.learningObjectives) return [];
    try { return JSON.parse(c.learningObjectives); } catch { return []; }
  });

  readonly parsedPrerequisites = computed(() => {
    const c = this.course();
    if (!c?.prerequisites) return [];
    try { return JSON.parse(c.prerequisites); } catch { return []; }
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId.set(id);
      this.loadCourse();
      this.loadEnrollment();
      this.loadReviews();
    }
  }

  loadCourse(): void {
    this.loading.set(true);
    this.coursesService.getCourse(this.courseId()).subscribe({
      next: (response) => {
        this.course.set(response.data ?? (response as any));
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải khóa học' });
        this.loading.set(false);
      },
    });
  }

  loadEnrollment(): void {
    this.coursesService.getMyEnrollment(this.courseId()).subscribe({
      next: (response) => {
        this.enrollment.set(response.data ?? null);
        if (this.isEnrolled()) {
          this.loadProgress();
        }
      },
      error: () => {
        this.enrollment.set(null);
      },
    });
  }

  loadProgress(): void {
    this.coursesService.getMyCourseProgress(this.courseId()).subscribe({
      next: (response) => {
        this.progress.set(response.data ?? null);
      },
    });
  }

  loadReviews(): void {
    this.coursesService.getReviews(this.courseId()).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.reviews.set(Array.isArray(data) ? data : []);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // ==================== ENROLLMENT ====================

  enroll(): void {
    const c = this.course();
    // If course is private, show password dialog
    if (c && !c.isPublic) {
      this.enrollPassword = '';
      this.showPasswordDialog.set(true);
      return;
    }
    this.doEnroll();
  }

  enrollWithPassword(): void {
    this.showPasswordDialog.set(false);
    this.doEnroll(this.enrollPassword);
  }

  private doEnroll(password?: string): void {
    this.enrolling.set(true);
    this.coursesService.enrollCourse(this.courseId(), password).subscribe({
      next: (response) => {
        this.enrollment.set(response.data ?? null);
        this.enrolling.set(false);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã đăng ký khóa học' });
        this.loadProgress();
        this.reloadCourseData();
      },
      error: (err) => {
        this.enrolling.set(false);
        const msg = err?.error?.message || 'Không thể đăng ký khóa học';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: msg });
      },
    });
  }

  unenroll(): void {
    this.coursesService.unenrollCourse(this.courseId()).subscribe({
      next: () => {
        this.enrollment.set(null);
        this.progress.set(null);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã hủy đăng ký' });
        this.reloadCourseData();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể hủy đăng ký' });
      },
    });
  }

  // ==================== NAVIGATION ====================

  navigateToLesson(sectionId: string, lessonId: string): void {
    if (!this.isEnrolled()) {
      this.messageService.add({ severity: 'warn', summary: 'Chú ý', detail: 'Bạn cần đăng ký khóa học để xem bài học' });
      return;
    }
    this.router.navigate(['sections', sectionId, 'lessons', lessonId], { relativeTo: this.route });
  }

  // ==================== REVIEWS ====================

  openReviewDialog(): void {
    this.reviewRating = 5;
    this.reviewComment = '';
    this.showReviewDialog.set(true);
  }

  submitReview(): void {
    this.coursesService.createReview(this.courseId(), {
      rating: this.reviewRating,
      comment: this.reviewComment || undefined,
    }).subscribe({
      next: () => {
        this.showReviewDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã gửi đánh giá' });
        this.loadReviews();
        this.reloadCourseData();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể gửi đánh giá' });
      },
    });
  }

  /** Reload course data without showing skeleton loader */
  private reloadCourseData(): void {
    this.coursesService.getCourse(this.courseId()).subscribe({
      next: (response) => {
        this.course.set(response.data ?? (response as any));
      },
    });
  }

  setRating(star: number): void {
    this.reviewRating = star;
  }

  // ==================== HELPERS ====================

  getTotalLessons(): number {
    const c = this.course();
    if (!c?.sections) return 0;
    return c.sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
  }

  roundRating(rating: number): number {
    return Math.round(rating);
  }

  getStarCount(star: number): number {
    return this.reviews().filter(r => Math.round(r.rating) === star).length;
  }

  getStarPercent(star: number): number {
    const total = this.reviews().length;
    if (total === 0) return 0;
    return (this.getStarCount(star) / total) * 100;
  }

  getLevelLabel(level: CourseLevelEnum): string {
    const labels: Record<string, string> = {
      beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
    };
    return labels[level] || level;
  }

  getLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner: return 'success';
      case CourseLevelEnum.Intermediate: return 'info';
      case CourseLevelEnum.Advanced: return 'warn';
      default: return 'info';
    }
  }

  getStatusLabel(status: CourseStatusEnum): string {
    const labels: Record<string, string> = {
      draft: 'Nháp', published: 'Xuất bản', archived: 'Lưu trữ',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: CourseStatusEnum): 'success' | 'info' | 'secondary' {
    switch (status) {
      case CourseStatusEnum.Published: return 'success';
      case CourseStatusEnum.Draft: return 'info';
      case CourseStatusEnum.Archived: return 'secondary';
      default: return 'info';
    }
  }

  getLessonTypeIcon(type: LessonTypeEnum): string {
    switch (type) {
      case LessonTypeEnum.Video: return 'pi-play-circle';
      case LessonTypeEnum.Text: return 'pi-file';
      case LessonTypeEnum.Quiz: return 'pi-question-circle';
      case LessonTypeEnum.Practice: return 'pi-code';
      default: return 'pi-file';
    }
  }

  getLessonTypeLabel(type: LessonTypeEnum): string {
    const labels: Record<string, string> = {
      video: 'Video', text: 'Văn bản', quiz: 'Quiz', practice: 'Thực hành',
    };
    return labels[type] || type;
  }

  isLessonCompleted(lessonId: number): boolean {
    const p = this.progress();
    if (!p?.lessons) return false;
    return p.lessons.some(l => l.lessonId === lessonId.toString() && l.isCompleted);
  }
}
