import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// PrimeNG
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

// Shared
import { MarkdownViewComponent } from '../../../../shared/components/markdown-view/markdown-view.component';

// Models & Enums
import {
  CourseLessonsModel,
  CourseLessonProblemsModel,
  CourseQuizzesModel,
  CourseQuizQuestionsModel,
  CourseQuizAttemptsModel,
  CourseAssignmentsModel,
  CourseAssignmentSubmissionsModel,
} from '../../../../data/models/courses.model';
import { LessonTypeEnum, QuizQuestionTypeEnum, AssignmentTypeEnum, AssignmentSubmissionStatusEnum } from '../../../../data/enums/enums';

// Services
import { StudentCoursesService } from '../services/courses.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-student-lesson-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Tag,
    Toast,
    Dialog,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Textarea,
    FileUpload,
  ],
  templateUrl: './lesson-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class StudentLessonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly messageService = inject(MessageService);

  // Route params
  readonly courseId = signal<string>('');
  readonly sectionId = signal<string>('');
  readonly lessonId = signal<string>('');

  // State
  readonly lesson = signal<CourseLessonsModel | null>(null);
  readonly loading = signal<boolean>(true);
  readonly activeTab = signal<string>('content');
  readonly markingComplete = signal<boolean>(false);

  // Sidebar navigation
  readonly sectionLessons = signal<CourseLessonsModel[]>([]);

  // Computed prev/next
  readonly prevLesson = computed(() => {
    const lessons = this.sectionLessons();
    const current = this.lesson();
    if (!current || lessons.length === 0) return null;
    const idx = lessons.findIndex(l => l.id === current.id);
    return idx > 0 ? lessons[idx - 1] : null;
  });

  readonly nextLesson = computed(() => {
    const lessons = this.sectionLessons();
    const current = this.lesson();
    if (!current || lessons.length === 0) return null;
    const idx = lessons.findIndex(l => l.id === current.id);
    return idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  });

  // ===== PROBLEMS =====
  readonly lessonProblems = signal<CourseLessonProblemsModel[]>([]);
  readonly loadingProblems = signal<boolean>(false);

  // ===== QUIZZES =====
  readonly quizzes = signal<CourseQuizzesModel[]>([]);
  readonly loadingQuizzes = signal<boolean>(false);
  readonly selectedQuiz = signal<CourseQuizzesModel | null>(null);
  readonly quizQuestions = signal<CourseQuizQuestionsModel[]>([]);
  readonly loadingQuestions = signal<boolean>(false);

  // Quiz attempt
  readonly quizAnswers = signal<Record<string, string>>({});
  readonly submittingQuiz = signal<boolean>(false);
  readonly quizResult = signal<CourseQuizAttemptsModel | null>(null);
  readonly myAttempts = signal<CourseQuizAttemptsModel[]>([]);

  // ===== ASSIGNMENTS =====
  readonly assignments = signal<CourseAssignmentsModel[]>([]);
  readonly loadingAssignments = signal<boolean>(false);
  readonly selectedAssignment = signal<CourseAssignmentsModel | null>(null);
  readonly mySubmissions = signal<CourseAssignmentSubmissionsModel[]>([]);
  readonly loadingSubmissions = signal<boolean>(false);

  // Assignment submission
  readonly showSubmitDialog = signal<boolean>(false);
  readonly submittingAssignment = signal<boolean>(false);
  assignmentContent = '';
  assignmentFiles: File[] = [];

  // Assignment edit
  readonly showEditDialog = signal<boolean>(false);
  readonly editingSubmission = signal<CourseAssignmentSubmissionsModel | null>(null);
  readonly updatingSubmission = signal<boolean>(false);
  readonly deletingSubmissionId = signal<string | null>(null);
  editContent = '';
  editFiles: File[] = [];

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    const sectionId = this.route.snapshot.paramMap.get('sectionId');
    const lessonId = this.route.snapshot.paramMap.get('lessonId');

    if (courseId && sectionId && lessonId) {
      this.courseId.set(courseId);
      this.sectionId.set(sectionId);
      this.lessonId.set(lessonId);
      this.loadLesson();
      this.loadSectionLessons();
      this.loadProblems();
      this.loadQuizzes();
      this.loadAssignments();
    }
  }

  loadLesson(): void {
    this.loading.set(true);
    this.coursesService.getLesson(this.courseId(), this.sectionId(), this.lessonId()).subscribe({
      next: (response) => {
        this.lesson.set(response.data ?? (response as any));
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải bài học' });
        this.loading.set(false);
      },
    });
  }

  loadSectionLessons(): void {
    this.coursesService.getLessons(this.courseId(), this.sectionId()).subscribe({
      next: (response) => {
        const lessons = response.data ?? (response as any);
        if (Array.isArray(lessons)) {
          this.sectionLessons.set(lessons.sort((a: any, b: any) => a.lessonOrder - b.lessonOrder));
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['../../..'], { relativeTo: this.route });
  }

  // ==================== MARK COMPLETE ====================

  markComplete(): void {
    this.markingComplete.set(true);
    this.coursesService.markLessonProgress(this.courseId(), this.sectionId(), this.lessonId()).subscribe({
      next: () => {
        this.markingComplete.set(false);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã hoàn thành bài học' });
      },
      error: () => {
        this.markingComplete.set(false);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể đánh dấu hoàn thành' });
      },
    });
  }

  // ==================== NAVIGATION ====================

  navigateToLesson(lessonId: string | number): void {
    this.router.navigate(['..', lessonId.toString()], { relativeTo: this.route });
    this.lessonId.set(lessonId.toString());
    this.loadLesson();
    this.loadProblems();
    this.loadQuizzes();
    this.loadAssignments();
    this.selectedQuiz.set(null);
    this.quizQuestions.set([]);
    this.quizResult.set(null);
    this.selectedAssignment.set(null);
    this.mySubmissions.set([]);
  }

  navigateToProblem(problemId: string | number): void {
    this.router.navigate(['/student/problems', problemId.toString()]);
  }

  // ==================== PROBLEMS ====================

  loadProblems(): void {
    this.loadingProblems.set(true);
    this.coursesService.getLessonProblems(this.courseId(), this.sectionId(), this.lessonId()).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.lessonProblems.set(Array.isArray(data) ? data.sort((a: any, b: any) => a.problemOrder - b.problemOrder) : []);
        this.loadingProblems.set(false);
      },
      error: () => {
        this.lessonProblems.set([]);
        this.loadingProblems.set(false);
      },
    });
  }

  // ==================== QUIZZES ====================

  loadQuizzes(): void {
    this.loadingQuizzes.set(true);
    this.coursesService.getQuizzes(this.courseId(), this.sectionId(), this.lessonId()).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.quizzes.set(Array.isArray(data) ? data.sort((a: any, b: any) => a.quizOrder - b.quizOrder) : []);
        this.loadingQuizzes.set(false);
      },
      error: () => {
        this.quizzes.set([]);
        this.loadingQuizzes.set(false);
      },
    });
  }

  selectQuiz(quiz: CourseQuizzesModel): void {
    this.selectedQuiz.set(quiz);
    this.quizResult.set(null);
    this.quizAnswers.set({});
    this.loadQuizQuestions(quiz.id.toString());
    this.loadMyAttempts(quiz.id.toString());
  }

  backToQuizList(): void {
    this.selectedQuiz.set(null);
    this.quizQuestions.set([]);
    this.quizResult.set(null);
    this.myAttempts.set([]);
  }

  loadQuizQuestions(quizId: string): void {
    this.loadingQuestions.set(true);
    this.coursesService.getQuizQuestions(this.courseId(), this.sectionId(), this.lessonId(), quizId).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.quizQuestions.set(Array.isArray(data) ? data.sort((a: any, b: any) => a.questionOrder - b.questionOrder) : []);
        this.loadingQuestions.set(false);
      },
      error: () => {
        this.quizQuestions.set([]);
        this.loadingQuestions.set(false);
      },
    });
  }

  loadMyAttempts(quizId: string): void {
    this.coursesService.getMyQuizAttempts(this.courseId(), this.sectionId(), this.lessonId(), quizId).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.myAttempts.set(Array.isArray(data) ? data : []);
      },
    });
  }

  setQuizAnswer(questionId: string, answer: string): void {
    this.quizAnswers.update(answers => ({ ...answers, [questionId]: answer }));
  }

  submitQuiz(): void {
    const quiz = this.selectedQuiz();
    if (!quiz) return;

    const answers = this.quizQuestions().map(q => ({
      questionId: q.id.toString(),
      answer: this.quizAnswers()[q.id.toString()] || '',
    }));

    this.submittingQuiz.set(true);
    this.coursesService.submitQuizAttempt(this.courseId(), this.sectionId(), this.lessonId(), quiz.id.toString(), { answers }).subscribe({
      next: (response) => {
        this.quizResult.set(response.data ?? null);
        this.submittingQuiz.set(false);
        this.messageService.add({
          severity: (response.data as any)?.isPassed ? 'success' : 'warn',
          summary: (response.data as any)?.isPassed ? 'Đạt!' : 'Chưa đạt',
          detail: `Điểm: ${(response.data as any)?.score ?? 0}/${(response.data as any)?.totalPoints ?? 0}`,
        });
        this.loadMyAttempts(quiz.id.toString());
      },
      error: () => {
        this.submittingQuiz.set(false);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể nộp bài quiz' });
      },
    });
  }

  // ==================== ASSIGNMENTS ====================

  loadAssignments(): void {
    this.loadingAssignments.set(true);
    this.coursesService.getAssignments(this.courseId(), this.lessonId()).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.assignments.set(Array.isArray(data) ? data.sort((a: any, b: any) => a.assignmentOrder - b.assignmentOrder) : []);
        this.loadingAssignments.set(false);
      },
      error: () => {
        this.assignments.set([]);
        this.loadingAssignments.set(false);
      },
    });
  }

  selectAssignment(assignment: CourseAssignmentsModel): void {
    this.selectedAssignment.set(assignment);
    this.loadMyAssignmentSubmissions(assignment.id.toString());
  }

  backToAssignmentList(): void {
    this.selectedAssignment.set(null);
    this.mySubmissions.set([]);
  }

  loadMyAssignmentSubmissions(assignmentId: string): void {
    this.loadingSubmissions.set(true);
    this.coursesService.getMySubmissions(this.courseId(), this.lessonId(), assignmentId).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.mySubmissions.set(Array.isArray(data) ? data : []);
        this.loadingSubmissions.set(false);
      },
      error: () => {
        this.mySubmissions.set([]);
        this.loadingSubmissions.set(false);
      },
    });
  }

  openSubmitDialog(): void {
    this.assignmentContent = '';
    this.assignmentFiles = [];
    this.showSubmitDialog.set(true);
  }

  onFileSelect(event: any): void {
    this.assignmentFiles = event.files ? Array.from(event.files) : [];
  }

  removeFile(index: number): void {
    this.assignmentFiles = this.assignmentFiles.filter((_, i) => i !== index);
  }

  submitAssignment(): void {
    const assignment = this.selectedAssignment();
    if (!assignment) return;

    this.submittingAssignment.set(true);
    const dto = { content: this.assignmentContent || undefined };

    this.coursesService.submitAssignment(
      this.courseId(),
      this.lessonId(),
      assignment.id.toString(),
      dto,
      this.assignmentFiles.length > 0 ? this.assignmentFiles : undefined,
    ).subscribe({
      next: () => {
        this.submittingAssignment.set(false);
        this.showSubmitDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã nộp bài tập' });
        this.loadMyAssignmentSubmissions(assignment.id.toString());
      },
      error: () => {
        this.submittingAssignment.set(false);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể nộp bài tập' });
      },
    });
  }

  // ==================== EDIT SUBMISSION ====================

  openEditDialog(submission: CourseAssignmentSubmissionsModel): void {
    this.editingSubmission.set(submission);
    this.editContent = submission.content || '';
    this.editFiles = [];
    this.showEditDialog.set(true);
  }

  onEditFileSelect(event: any): void {
    this.editFiles = event.files ? Array.from(event.files) : [];
  }

  removeEditFile(index: number): void {
    this.editFiles = this.editFiles.filter((_, i) => i !== index);
  }

  updateSubmission(): void {
    const assignment = this.selectedAssignment();
    const submission = this.editingSubmission();
    if (!assignment || !submission) return;

    this.updatingSubmission.set(true);
    const dto = { content: this.editContent || undefined };

    this.coursesService.updateSubmission(
      this.courseId(),
      this.lessonId(),
      assignment.id.toString(),
      submission.id.toString(),
      dto,
      this.editFiles.length > 0 ? this.editFiles : undefined,
    ).subscribe({
      next: () => {
        this.updatingSubmission.set(false);
        this.showEditDialog.set(false);
        this.editingSubmission.set(null);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài nộp' });
        this.loadMyAssignmentSubmissions(assignment.id.toString());
      },
      error: () => {
        this.updatingSubmission.set(false);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài nộp' });
      },
    });
  }

  // ==================== DELETE SUBMISSION ====================

  deleteSubmission(submission: CourseAssignmentSubmissionsModel): void {
    const assignment = this.selectedAssignment();
    if (!assignment) return;

    this.deletingSubmissionId.set(submission.id.toString());
    this.coursesService.deleteSubmission(
      this.courseId(),
      this.lessonId(),
      assignment.id.toString(),
      submission.id.toString(),
    ).subscribe({
      next: () => {
        this.deletingSubmissionId.set(null);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài nộp' });
        this.loadMyAssignmentSubmissions(assignment.id.toString());
      },
      error: () => {
        this.deletingSubmissionId.set(null);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài nộp' });
      },
    });
  }

  // ==================== DOWNLOAD SUBMISSION FILE ====================

  downloadSubmissionFile(submission: CourseAssignmentSubmissionsModel, fileIndex: number = 0): void {
    if (!submission.submissionFiles || submission.submissionFiles.length === 0) return;
    const assignment = this.selectedAssignment();
    if (!assignment) return;

    const fileInfo = submission.submissionFiles[fileIndex];
    if (!fileInfo) return;

    const url = `${environment.apiUrl}/courses/${this.courseId()}/lessons/${this.lessonId()}/assignments/${assignment.id}/submissions/${submission.id}/download?fileIndex=${fileIndex}`;
    const token = localStorage.getItem('access_token');

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileInfo.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải file' });
      });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  canEditSubmission(submission: CourseAssignmentSubmissionsModel): boolean {
    return submission.status !== AssignmentSubmissionStatusEnum.Graded;
  }

  // ==================== HELPERS ====================

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

  getLessonTypeSeverity(type: LessonTypeEnum): 'info' | 'success' | 'warn' | 'secondary' {
    switch (type) {
      case LessonTypeEnum.Video: return 'info';
      case LessonTypeEnum.Text: return 'secondary';
      case LessonTypeEnum.Quiz: return 'warn';
      case LessonTypeEnum.Practice: return 'success';
      default: return 'info';
    }
  }

  getQuestionTypeLabel(type: QuizQuestionTypeEnum): string {
    const labels: Record<string, string> = {
      multiple_choice: 'Trắc nghiệm',
      true_false: 'Đúng / Sai',
      short_answer: 'Trả lời ngắn',
      code: 'Code',
    };
    return labels[type] || type;
  }

  getSubmissionStatusLabel(status: AssignmentSubmissionStatusEnum): string {
    const labels: Record<string, string> = {
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      returned: 'Trả lại',
      late: 'Nộp muộn',
    };
    return labels[status] || status;
  }

  getSubmissionStatusSeverity(status: AssignmentSubmissionStatusEnum): 'info' | 'success' | 'warn' | 'secondary' {
    switch (status) {
      case AssignmentSubmissionStatusEnum.Graded: return 'success';
      case AssignmentSubmissionStatusEnum.Submitted: return 'info';
      case AssignmentSubmissionStatusEnum.Returned: return 'warn';
      case AssignmentSubmissionStatusEnum.Late: return 'secondary';
      default: return 'secondary';
    }
  }

  isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com|youtu\.be)/i.test(url);
  }

  getSafeYouTubeUrl(url: string): SafeResourceUrl {
    let videoId = '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) videoId = match[1];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} phút ${s > 0 ? s + ' giây' : ''}` : `${s} giây`;
  }

  getAssignmentTypeLabel(type: AssignmentTypeEnum): string {
    const labels: Record<string, string> = {
      file_upload: 'Nộp file',
      code_submit: 'Nộp code',
      mixed: 'Kết hợp',
    };
    return labels[type] || type;
  }
}
