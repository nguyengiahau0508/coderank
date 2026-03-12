import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TextEditorComponent } from '../../../../shared/components/text-editor/text-editor.component';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { Accordion } from 'primeng/accordion';
import { AccordionPanel } from 'primeng/accordion';
import { AccordionHeader } from 'primeng/accordion';
import { AccordionContent } from 'primeng/accordion';
import { Tabs } from 'primeng/tabs';
import { TabList } from 'primeng/tabs';
import { Tab } from 'primeng/tabs';
import { TabPanels } from 'primeng/tabs';
import { TabPanel } from 'primeng/tabs';
import { ConfirmationService, MessageService } from 'primeng/api';

// Models & Enums
import { CoursesModel, CourseSectionsModel, CourseLessonsModel, CourseReviewsModel } from '../../../../data/models/courses.model';
import { CourseLevelEnum, CourseStatusEnum, LessonTypeEnum } from '../../../../data/enums/enums';

// Services
import { CoursesService } from '../services/courses.service';

@Component({
  selector: 'app-admin-course-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Toast,
    ConfirmDialog,
    Dialog,
    InputText,
    TextEditorComponent,
    InputNumber,
    Select,
    ToggleSwitch,
    Tooltip,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  // State
  readonly course = signal<CoursesModel | null>(null);
  readonly loading = signal<boolean>(true);
  readonly courseId = signal<string>('');
  readonly activeTab = signal<string>('intro');
  readonly reviews = signal<CourseReviewsModel[]>([]);

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

  // Section dialog
  readonly showSectionDialog = signal<boolean>(false);
  readonly editingSection = signal<CourseSectionsModel | null>(null);
  sectionForm: any = { title: '', description: '', sectionOrder: 0, isPublished: false };

  // Lesson dialog
  readonly showLessonDialog = signal<boolean>(false);
  readonly editingLesson = signal<CourseLessonsModel | null>(null);
  readonly targetSectionId = signal<string>('');
  lessonForm: any = { title: '', content: '', type: LessonTypeEnum.Text, videoUrl: '', lessonOrder: 0, estimatedMinutes: null, isPublished: false, isFreePreview: false };

  readonly lessonTypeOptions = [
    { label: 'Văn bản', value: LessonTypeEnum.Text },
    { label: 'Video', value: LessonTypeEnum.Video },
    { label: 'Quiz', value: LessonTypeEnum.Quiz },
    { label: 'Thực hành', value: LessonTypeEnum.Practice },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId.set(id);
      this.loadCourse();
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

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  navigateToLesson(sectionId: string, lessonId: string): void {
    this.router.navigate(['sections', sectionId, 'lessons', lessonId], { relativeTo: this.route });
  }

  loadReviews(): void {
    this.coursesService.getReviews(this.courseId()).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.reviews.set(Array.isArray(data) ? data : []);
      },
    });
  }

  // ==================== STATS HELPERS ====================

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

  // ==================== LEVEL / STATUS HELPERS ====================

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

  // ==================== SECTIONS ====================

  openCreateSection(): void {
    this.editingSection.set(null);
    const sections = this.course()?.sections || [];
    this.sectionForm = { title: '', description: '', sectionOrder: sections.length + 1, isPublished: false };
    this.showSectionDialog.set(true);
  }

  openEditSection(section: CourseSectionsModel): void {
    this.editingSection.set(section);
    this.sectionForm = {
      title: section.title,
      description: section.description || '',
      sectionOrder: section.sectionOrder,
      isPublished: section.isPublished,
    };
    this.showSectionDialog.set(true);
  }

  saveSection(): void {
    if (!this.sectionForm.title?.trim()) return;

    const data = { ...this.sectionForm };
    if (!data.description) delete data.description;

    if (this.editingSection()) {
      this.coursesService.updateSection(this.courseId(), this.editingSection()!.id.toString(), data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật chương' });
          this.showSectionDialog.set(false);
          this.loadCourse();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật chương' });
        },
      });
    } else {
      this.coursesService.createSection(this.courseId(), data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo chương mới' });
          this.showSectionDialog.set(false);
          this.loadCourse();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo chương' });
        },
      });
    }
  }

  deleteSection(event: Event, section: CourseSectionsModel): void {
    event.stopPropagation();
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa chương "${section.title}"? Tất cả bài học trong chương sẽ bị xóa.`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteSection(this.courseId(), section.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa chương' });
            this.loadCourse();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa chương' });
          },
        });
      },
    });
  }

  // ==================== LESSONS ====================

  openCreateLesson(sectionId: string): void {
    this.editingLesson.set(null);
    this.targetSectionId.set(sectionId);
    const section = this.course()?.sections?.find(s => s.id.toString() === sectionId);
    const lessons = section?.lessons || [];
    this.lessonForm = {
      title: '', content: '', type: LessonTypeEnum.Text, videoUrl: '',
      lessonOrder: lessons.length + 1, estimatedMinutes: null, isPublished: false, isFreePreview: false,
    };
    this.showLessonDialog.set(true);
  }

  openEditLesson(sectionId: string, lesson: CourseLessonsModel): void {
    this.editingLesson.set(lesson);
    this.targetSectionId.set(sectionId);
    this.lessonForm = {
      title: lesson.title,
      content: lesson.content || '',
      type: lesson.type,
      videoUrl: lesson.videoUrl || '',
      lessonOrder: lesson.lessonOrder,
      estimatedMinutes: lesson.estimatedMinutes,
      isPublished: lesson.isPublished,
      isFreePreview: lesson.isFreePreview,
    };
    this.showLessonDialog.set(true);
  }

  saveLesson(): void {
    if (!this.lessonForm.title?.trim()) return;

    const data = { ...this.lessonForm };
    if (!data.content) delete data.content;
    if (!data.videoUrl) delete data.videoUrl;

    if (this.editingLesson()) {
      this.coursesService.updateLesson(this.courseId(), this.targetSectionId(), this.editingLesson()!.id.toString(), data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài học' });
          this.showLessonDialog.set(false);
          this.loadCourse();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài học' });
        },
      });
    } else {
      this.coursesService.createLesson(this.courseId(), this.targetSectionId(), data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo bài học mới' });
          this.showLessonDialog.set(false);
          this.loadCourse();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo bài học' });
        },
      });
    }
  }

  deleteLesson(event: Event, sectionId: string, lesson: CourseLessonsModel): void {
    event.stopPropagation();
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa bài học "${lesson.title}"?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteLesson(this.courseId(), sectionId, lesson.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài học' });
            this.loadCourse();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài học' });
          },
        });
      },
    });
  }
}
