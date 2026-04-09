import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// PrimeNG
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { TextEditorComponent } from '../../../../../shared/components/text-editor/text-editor.component';
import { HighlightCodeDirective } from '../../../../../shared/directives/highlight-code.directive';
import { CoursesService } from '../../../../../shared/services/courses/courses.service';
import { ChatContextService } from '../../../../../core/services/chat-context.service';
import { LessonChatContext } from '../../../../../core/models/chat-context.model';
import { AssignmentSubmissionStatusEnum, AssignmentTypeEnum, CourseAssignmentsModel, CourseAssignmentSubmissionsModel, CourseLessonProblemsModel, CourseLessonsModel, CourseQuizQuestionsModel, CourseQuizzesModel, LessonTypeEnum, ProblemsModel, QuizQuestionTypeEnum } from '../../../../../data';

@Component({
  selector: 'app-admin-lesson-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Toast,
    ConfirmDialog,
    Dialog,
    InputText,
    InputNumber,
    Select,
    ToggleSwitch,
    Tooltip,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Textarea,
    Checkbox,
    TextEditorComponent,
    FileUpload,
    HighlightCodeDirective,
  ],
  templateUrl: './lesson-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})
export class AdminLessonDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly coursesService = inject(CoursesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly chatContextService = inject(ChatContextService);

  // Route params
  readonly courseId = signal<string>('');
  readonly sectionId = signal<string>('');
  readonly lessonId = signal<string>('');

  // State
  readonly lesson = signal<CourseLessonsModel | null>(null);
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly showEditDialog = signal<boolean>(false);
  readonly activeTab = signal<string>('content');

  // Section lessons for sidebar navigation
  readonly sectionLessons = signal<CourseLessonsModel[]>([]);

  // ===== PROBLEMS =====
  readonly lessonProblems = signal<CourseLessonProblemsModel[]>([]);
  readonly loadingProblems = signal<boolean>(false);
  readonly showProblemDialog = signal<boolean>(false);
  readonly editingProblem = signal<CourseLessonProblemsModel | null>(null);
  readonly savingProblem = signal<boolean>(false);
  problemForm: any = {};
  // Problem search
  readonly problemSearchResults = signal<ProblemsModel[]>([]);
  readonly problemSearchLoading = signal<boolean>(false);
  readonly problemSearchQuery = signal<string>('');

  // ===== QUIZZES =====
  readonly quizzes = signal<CourseQuizzesModel[]>([]);
  readonly loadingQuizzes = signal<boolean>(false);
  readonly showQuizDialog = signal<boolean>(false);
  readonly editingQuiz = signal<CourseQuizzesModel | null>(null);
  readonly savingQuiz = signal<boolean>(false);
  quizForm: any = {};

  // ===== QUIZ QUESTIONS =====
  readonly selectedQuiz = signal<CourseQuizzesModel | null>(null);
  readonly quizQuestions = signal<CourseQuizQuestionsModel[]>([]);
  readonly loadingQuestions = signal<boolean>(false);
  readonly showQuestionDialog = signal<boolean>(false);
  readonly editingQuestion = signal<CourseQuizQuestionsModel | null>(null);
  readonly savingQuestion = signal<boolean>(false);
  questionForm: any = {};

  // ===== ASSIGNMENTS =====
  readonly assignments = signal<CourseAssignmentsModel[]>([]);
  readonly loadingAssignments = signal<boolean>(false);
  readonly showAssignmentDialog = signal<boolean>(false);
  readonly editingAssignment = signal<CourseAssignmentsModel | null>(null);
  readonly savingAssignment = signal<boolean>(false);
  assignmentForm: any = {};
  assignmentFile: File | null = null;

  // ===== ASSIGNMENT SUBMISSIONS =====
  readonly selectedAssignment = signal<CourseAssignmentsModel | null>(null);
  readonly submissions = signal<CourseAssignmentSubmissionsModel[]>([]);
  readonly loadingSubmissions = signal<boolean>(false);
  readonly showGradeDialog = signal<boolean>(false);
  readonly gradingSubmission = signal<CourseAssignmentSubmissionsModel | null>(null);
  readonly savingGrade = signal<boolean>(false);
  gradeForm: any = {};

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

  // Edit form
  editForm: any = {};

  readonly lessonTypeOptions = [
    { label: 'Văn bản', value: LessonTypeEnum.Text },
    { label: 'Video', value: LessonTypeEnum.Video },
    { label: 'Quiz', value: LessonTypeEnum.Quiz },
    { label: 'Thực hành', value: LessonTypeEnum.Practice },
  ];

  readonly questionTypeOptions = [
    { label: 'Trắc nghiệm', value: QuizQuestionTypeEnum.MultipleChoice },
    { label: 'Đúng / Sai', value: QuizQuestionTypeEnum.TrueFalse },
    { label: 'Trả lời ngắn', value: QuizQuestionTypeEnum.ShortAnswer },
    { label: 'Code', value: QuizQuestionTypeEnum.Code },
  ];

  readonly assignmentTypeOptions = [
    { label: 'Nộp file', value: AssignmentTypeEnum.FileUpload },
    { label: 'Nộp code', value: AssignmentTypeEnum.CodeSubmit },
    { label: 'Kết hợp', value: AssignmentTypeEnum.Mixed },
  ];

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
        const lesson = response.data ?? (response as any);
        this.lesson.set(lesson);
        this.loading.set(false);
        this.updateChatContext(lesson);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải bài học' });
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.chatContextService.popContext();
  }

  private updateChatContext(lesson: CourseLessonsModel): void {
    const context: LessonChatContext = {
      type: 'lesson',
      lessonId: lesson.id,
      title: lesson.title,
      courseTitle: (lesson as any).course?.title ?? '',
    };
    this.chatContextService.pushContext(context);
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

  getQuestionTypeSeverity(type: QuizQuestionTypeEnum): 'info' | 'success' | 'warn' | 'secondary' {
    switch (type) {
      case QuizQuestionTypeEnum.MultipleChoice: return 'info';
      case QuizQuestionTypeEnum.TrueFalse: return 'success';
      case QuizQuestionTypeEnum.ShortAnswer: return 'warn';
      case QuizQuestionTypeEnum.Code: return 'secondary';
      default: return 'info';
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

  // ==================== NAVIGATION ====================

  navigateToLesson(lessonId: string | number): void {
    this.router.navigate(['..', lessonId.toString()], { relativeTo: this.route });
    this.lessonId.set(lessonId.toString());
    this.loadLesson();
    this.loadProblems();
    this.loadAssignments();
    this.selectedQuiz.set(null);
    this.quizQuestions.set([]);
    this.selectedAssignment.set(null);
    this.submissions.set([]);
  }

  navigateToProblem(problemId: string | number): void {
    this.router.navigate(['/admin/problems', problemId.toString()]);
  }

  // ==================== EDIT LESSON ====================

  openEditDialog(): void {
    const l = this.lesson();
    if (!l) return;
    this.editForm = {
      title: l.title,
      content: l.content || '',
      type: l.type,
      videoUrl: l.videoUrl || '',
      lessonOrder: l.lessonOrder,
      estimatedMinutes: l.estimatedMinutes,
      isPublished: l.isPublished,
      isFreePreview: l.isFreePreview,
    };
    this.showEditDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.title?.trim()) return;
    this.saving.set(true);

    const data = { ...this.editForm };
    if (!data.content) delete data.content;
    if (!data.videoUrl) delete data.videoUrl;

    this.coursesService.updateLesson(this.courseId(), this.sectionId(), this.lessonId(), data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài học' });
        this.showEditDialog.set(false);
        this.saving.set(false);
        this.loadLesson();
        this.loadSectionLessons();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài học' });
        this.saving.set(false);
      },
    });
  }

  // ==================== DELETE LESSON ====================

  confirmDelete(event: Event): void {
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa bài học "${this.lesson()?.title}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteLesson(this.courseId(), this.sectionId(), this.lessonId()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài học' });
            this.goBack();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài học' });
          },
        });
      },
    });
  }

  // ==================== LESSON PROBLEMS ====================

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

  searchProblems(): void {
    const q = this.problemSearchQuery();
    if (!q || q.length < 1) {
      this.problemSearchResults.set([]);
      return;
    }
    this.problemSearchLoading.set(true);
    this.coursesService.searchProblems({ search: q, limit: 20 }).subscribe({
      next: (response) => {
        const items = response.data ?? [];
        // Filter out already added problems
        const existingIds = new Set(this.lessonProblems().map(p => p.problemId));
        this.problemSearchResults.set((items as any[]).filter(p => !existingIds.has(p.id)));
        this.problemSearchLoading.set(false);
      },
      error: () => {
        this.problemSearchResults.set([]);
        this.problemSearchLoading.set(false);
      },
    });
  }

  openAddProblemDialog(): void {
    this.editingProblem.set(null);
    this.problemForm = {
      problemId: '',
      problemOrder: this.lessonProblems().length + 1,
      isRequired: false,
      label: '',
    };
    this.problemSearchQuery.set('');
    this.problemSearchResults.set([]);
    this.showProblemDialog.set(true);
  }

  openEditProblemDialog(lp: CourseLessonProblemsModel): void {
    this.editingProblem.set(lp);
    this.problemForm = {
      problemOrder: lp.problemOrder,
      isRequired: lp.isRequired,
      label: lp.label || '',
    };
    this.showProblemDialog.set(true);
  }

  selectProblem(problem: ProblemsModel): void {
    this.problemForm.problemId = problem.id.toString();
    this.problemForm.selectedProblem = problem;
    this.problemSearchResults.set([]);
    this.problemSearchQuery.set(problem.title);
  }

  saveProblem(): void {
    const editing = this.editingProblem();
    this.savingProblem.set(true);

    if (editing) {
      // Update
      const dto: any = {
        problemOrder: this.problemForm.problemOrder,
        isRequired: this.problemForm.isRequired,
      };
      if (this.problemForm.label) dto.label = this.problemForm.label;
      this.coursesService.updateLessonProblem(this.courseId(), this.sectionId(), this.lessonId(), editing.id.toString(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài tập' });
          this.showProblemDialog.set(false);
          this.savingProblem.set(false);
          this.loadProblems();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài tập' });
          this.savingProblem.set(false);
        },
      });
    } else {
      // Create
      if (!this.problemForm.problemId) {
        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn một bài tập' });
        this.savingProblem.set(false);
        return;
      }
      const dto: any = {
        problemId: this.problemForm.problemId,
        problemOrder: this.problemForm.problemOrder,
        isRequired: this.problemForm.isRequired,
      };
      if (this.problemForm.label) dto.label = this.problemForm.label;
      this.coursesService.addProblemToLesson(this.courseId(), this.sectionId(), this.lessonId(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm bài tập' });
          this.showProblemDialog.set(false);
          this.savingProblem.set(false);
          this.loadProblems();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm bài tập' });
          this.savingProblem.set(false);
        },
      });
    }
  }

  confirmRemoveProblem(lp: CourseLessonProblemsModel): void {
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa bài tập "${lp.problem?.title || lp.label || 'này'}" khỏi bài học?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.removeProblemFromLesson(this.courseId(), this.sectionId(), this.lessonId(), lp.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài tập' });
            this.loadProblems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài tập' });
          },
        });
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

  openAddQuizDialog(): void {
    this.editingQuiz.set(null);
    this.quizForm = {
      title: '',
      description: '',
      timeLimitMinutes: null,
      passingScore: 50,
      maxAttempts: 3,
      quizOrder: this.quizzes().length + 1,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      isPublished: false,
    };
    this.showQuizDialog.set(true);
  }

  openEditQuizDialog(quiz: CourseQuizzesModel): void {
    this.editingQuiz.set(quiz);
    this.quizForm = {
      title: quiz.title,
      description: quiz.description || '',
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      quizOrder: quiz.quizOrder,
      shuffleQuestions: quiz.shuffleQuestions,
      showCorrectAnswers: quiz.showCorrectAnswers,
      isPublished: quiz.isPublished,
    };
    this.showQuizDialog.set(true);
  }

  saveQuiz(): void {
    if (!this.quizForm.title?.trim()) return;
    this.savingQuiz.set(true);
    const editing = this.editingQuiz();
    const dto: any = { ...this.quizForm };
    if (!dto.description) delete dto.description;

    if (editing) {
      this.coursesService.updateQuiz(this.courseId(), this.sectionId(), this.lessonId(), editing.id.toString(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài kiểm tra' });
          this.showQuizDialog.set(false);
          this.savingQuiz.set(false);
          this.loadQuizzes();
          // Refresh selected quiz if it's the one edited
          if (this.selectedQuiz()?.id === editing.id) {
            this.selectQuiz({ ...editing, ...dto });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài kiểm tra' });
          this.savingQuiz.set(false);
        },
      });
    } else {
      this.coursesService.createQuiz(this.courseId(), this.sectionId(), this.lessonId(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo bài kiểm tra' });
          this.showQuizDialog.set(false);
          this.savingQuiz.set(false);
          this.loadQuizzes();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo bài kiểm tra' });
          this.savingQuiz.set(false);
        },
      });
    }
  }

  confirmDeleteQuiz(quiz: CourseQuizzesModel): void {
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa bài kiểm tra "${quiz.title}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteQuiz(this.courseId(), this.sectionId(), this.lessonId(), quiz.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài kiểm tra' });
            if (this.selectedQuiz()?.id === quiz.id) {
              this.selectedQuiz.set(null);
              this.quizQuestions.set([]);
            }
            this.loadQuizzes();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài kiểm tra' });
          },
        });
      },
    });
  }

  // ==================== QUIZ QUESTIONS ====================

  selectQuiz(quiz: CourseQuizzesModel): void {
    this.selectedQuiz.set(quiz);
    this.loadQuestions(quiz.id.toString());
  }

  deselectQuiz(): void {
    this.selectedQuiz.set(null);
    this.quizQuestions.set([]);
  }

  loadQuestions(quizId: string): void {
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

  openAddQuestionDialog(): void {
    this.editingQuestion.set(null);
    this.questionForm = {
      questionText: '',
      questionType: QuizQuestionTypeEnum.MultipleChoice,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: '',
      explanation: '',
      points: 1,
      questionOrder: this.quizQuestions().length + 1,
      imageUrl: '',
    };
    this.showQuestionDialog.set(true);
  }

  openEditQuestionDialog(q: CourseQuizQuestionsModel): void {
    this.editingQuestion.set(q);
    this.questionForm = {
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options && q.options.length > 0 ? [...q.options] : [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      points: q.points,
      questionOrder: q.questionOrder,
      imageUrl: q.imageUrl || '',
    };
    this.showQuestionDialog.set(true);
  }

  addOption(): void {
    this.questionForm.options.push({ text: '', isCorrect: false });
  }

  removeOption(index: number): void {
    if (this.questionForm.options.length > 2) {
      this.questionForm.options.splice(index, 1);
    }
  }

  saveQuestion(): void {
    if (!this.questionForm.questionText?.trim()) return;
    const quiz = this.selectedQuiz();
    if (!quiz) return;
    this.savingQuestion.set(true);

    const editing = this.editingQuestion();
    const dto: any = {
      questionText: this.questionForm.questionText,
      questionType: this.questionForm.questionType,
      points: this.questionForm.points,
      questionOrder: this.questionForm.questionOrder,
    };

    // Set options and correctAnswer based on type
    if (this.questionForm.questionType === QuizQuestionTypeEnum.MultipleChoice) {
      dto.options = this.questionForm.options.filter((o: any) => o.text?.trim());
      dto.correctAnswer = dto.options.filter((o: any) => o.isCorrect).map((o: any) => o.text).join('||');
    } else if (this.questionForm.questionType === QuizQuestionTypeEnum.TrueFalse) {
      dto.options = [{ text: 'Đúng', isCorrect: false }, { text: 'Sai', isCorrect: false }];
      dto.correctAnswer = this.questionForm.correctAnswer;
    } else {
      dto.correctAnswer = this.questionForm.correctAnswer;
    }

    if (this.questionForm.explanation) dto.explanation = this.questionForm.explanation;
    if (this.questionForm.imageUrl) dto.imageUrl = this.questionForm.imageUrl;

    if (editing) {
      this.coursesService.updateQuizQuestion(this.courseId(), this.sectionId(), this.lessonId(), quiz.id.toString(), editing.id.toString(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật câu hỏi' });
          this.showQuestionDialog.set(false);
          this.savingQuestion.set(false);
          this.loadQuestions(quiz.id.toString());
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật câu hỏi' });
          this.savingQuestion.set(false);
        },
      });
    } else {
      this.coursesService.createQuizQuestion(this.courseId(), this.sectionId(), this.lessonId(), quiz.id.toString(), dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm câu hỏi' });
          this.showQuestionDialog.set(false);
          this.savingQuestion.set(false);
          this.loadQuestions(quiz.id.toString());
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm câu hỏi' });
          this.savingQuestion.set(false);
        },
      });
    }
  }

  confirmDeleteQuestion(q: CourseQuizQuestionsModel): void {
    const quiz = this.selectedQuiz();
    if (!quiz) return;
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa câu hỏi này?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteQuizQuestion(this.courseId(), this.sectionId(), this.lessonId(), quiz.id.toString(), q.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa câu hỏi' });
            this.loadQuestions(quiz.id.toString());
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa câu hỏi' });
          },
        });
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

  openAddAssignmentDialog(): void {
    this.editingAssignment.set(null);
    this.assignmentFile = null;
    this.assignmentForm = {
      title: '',
      description: '',
      type: AssignmentTypeEnum.FileUpload,
      maxScore: 100,
      dueDate: '',
      assignmentOrder: this.assignments().length + 1,
      isPublished: false,
      allowedFileTypes: '.pdf,.docx,.zip,.rar',
      maxFileSizeMb: 10,
    };
    this.showAssignmentDialog.set(true);
  }

  openEditAssignmentDialog(a: CourseAssignmentsModel): void {
    this.editingAssignment.set(a);
    this.assignmentFile = null;
    this.assignmentForm = {
      title: a.title,
      description: a.description || '',
      type: a.type,
      maxScore: a.maxScore,
      dueDate: a.dueDate ? a.dueDate.substring(0, 16) : '',
      assignmentOrder: a.assignmentOrder,
      isPublished: a.isPublished,
      allowedFileTypes: a.allowedFileTypes || '',
      maxFileSizeMb: a.maxFileSizeMb,
    };
    this.showAssignmentDialog.set(true);
  }

  onAssignmentFileSelect(event: any): void {
    this.assignmentFile = event.files?.[0] || event.currentFiles?.[0] || null;
  }

  onAssignmentFileClear(): void {
    this.assignmentFile = null;
  }

  saveAssignment(): void {
    if (!this.assignmentForm.title?.trim()) return;
    this.savingAssignment.set(true);
    const editing = this.editingAssignment();
    const dto: any = { ...this.assignmentForm };
    if (!dto.description) delete dto.description;
    if (!dto.dueDate) delete dto.dueDate;
    if (!dto.allowedFileTypes) delete dto.allowedFileTypes;

    if (editing) {
      this.coursesService.updateAssignment(this.courseId(), this.lessonId(), editing.id.toString(), dto, this.assignmentFile ?? undefined).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật bài tập' });
          this.showAssignmentDialog.set(false);
          this.savingAssignment.set(false);
          this.loadAssignments();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật bài tập' });
          this.savingAssignment.set(false);
        },
      });
    } else {
      this.coursesService.createAssignment(this.courseId(), this.lessonId(), dto, this.assignmentFile ?? undefined).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo bài tập' });
          this.showAssignmentDialog.set(false);
          this.savingAssignment.set(false);
          this.loadAssignments();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo bài tập' });
          this.savingAssignment.set(false);
        },
      });
    }
  }

  confirmDeleteAssignment(a: CourseAssignmentsModel): void {
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa bài tập "${a.title}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteAssignment(this.courseId(), this.lessonId(), a.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài tập' });
            if (this.selectedAssignment()?.id === a.id) {
              this.selectedAssignment.set(null);
              this.submissions.set([]);
            }
            this.loadAssignments();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài tập' });
          },
        });
      },
    });
  }

  getAssignmentTypeLabel(type: AssignmentTypeEnum): string {
    const labels: Record<string, string> = {
      file_upload: 'Nộp file',
      code_submit: 'Nộp code',
      mixed: 'Kết hợp',
    };
    return labels[type] || type;
  }

  getAssignmentTypeSeverity(type: AssignmentTypeEnum): 'info' | 'success' | 'warn' | 'secondary' {
    switch (type) {
      case AssignmentTypeEnum.FileUpload: return 'info';
      case AssignmentTypeEnum.CodeSubmit: return 'success';
      case AssignmentTypeEnum.Mixed: return 'warn';
      default: return 'info';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ==================== ASSIGNMENT SUBMISSIONS ====================

  selectAssignment(a: CourseAssignmentsModel): void {
    this.selectedAssignment.set(a);
    this.loadSubmissions(a.id.toString());
  }

  deselectAssignment(): void {
    this.selectedAssignment.set(null);
    this.submissions.set([]);
  }

  loadSubmissions(assignmentId: string): void {
    this.loadingSubmissions.set(true);
    this.coursesService.getSubmissions(this.courseId(), this.lessonId(), assignmentId).subscribe({
      next: (response) => {
        const data = response.data ?? (response as any);
        this.submissions.set(Array.isArray(data) ? data : []);
        this.loadingSubmissions.set(false);
      },
      error: () => {
        this.submissions.set([]);
        this.loadingSubmissions.set(false);
      },
    });
  }

  openGradeDialog(sub: CourseAssignmentSubmissionsModel): void {
    this.gradingSubmission.set(sub);
    this.gradeForm = {
      score: sub.score ?? 0,
      feedback: sub.feedback || '',
      status: sub.status || AssignmentSubmissionStatusEnum.Graded,
    };
    this.showGradeDialog.set(true);
  }

  saveGrade(): void {
    const sub = this.gradingSubmission();
    const assignment = this.selectedAssignment();
    if (!sub || !assignment) return;
    this.savingGrade.set(true);

    this.coursesService.gradeSubmission(this.courseId(), this.lessonId(), assignment.id.toString(), sub.id.toString(), this.gradeForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chấm điểm' });
        this.showGradeDialog.set(false);
        this.savingGrade.set(false);
        this.loadSubmissions(assignment.id.toString());
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể chấm điểm' });
        this.savingGrade.set(false);
      },
    });
  }

  getSubmissionStatusLabel(status: AssignmentSubmissionStatusEnum): string {
    const labels: Record<string, string> = {
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      returned: 'Đã trả',
      late: 'Nộp trễ',
    };
    return labels[status] || status;
  }

  getSubmissionStatusSeverity(status: AssignmentSubmissionStatusEnum): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case AssignmentSubmissionStatusEnum.Submitted: return 'info';
      case AssignmentSubmissionStatusEnum.Graded: return 'success';
      case AssignmentSubmissionStatusEnum.Returned: return 'warn';
      case AssignmentSubmissionStatusEnum.Late: return 'danger';
      default: return 'secondary';
    }
  }

  confirmDeleteSubmission(sub: CourseAssignmentSubmissionsModel): void {
    const assignment = this.selectedAssignment();
    if (!assignment) return;
    this.confirmService.confirm({
      message: 'Bạn có chắc muốn xóa bài nộp này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteSubmission(this.courseId(), this.lessonId(), assignment.id.toString(), sub.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài nộp' });
            this.loadSubmissions(assignment.id.toString());
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài nộp' });
          },
        });
      },
    });
  }
}
