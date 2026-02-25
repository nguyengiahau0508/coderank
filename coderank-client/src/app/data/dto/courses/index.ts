import { CourseLevelEnum, CourseStatusEnum, LessonTypeEnum, QuizQuestionTypeEnum, AssignmentTypeEnum, AssignmentSubmissionStatusEnum } from '../../enums/enums';

// ==================== COURSE ====================
export interface CreateCourseDto {
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  thumbnailUrl?: string;
  level?: CourseLevelEnum;
  status?: CourseStatusEnum;
  isPublic?: boolean;
  password?: string;
  maxStudents?: number;
  estimatedDurationMinutes?: number;
  tags?: string;
  category?: string;
  learningObjectives?: string;
  prerequisites?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface PaginationQueryCoursesDto {
  page?: number;
  limit?: number;
  search?: string;
  level?: CourseLevelEnum;
  status?: CourseStatusEnum;
  isPublic?: boolean;
  category?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ==================== SECTION ====================
export interface CreateSectionDto {
  title: string;
  description?: string;
  sectionOrder?: number;
  isPublished?: boolean;
}

export interface UpdateSectionDto extends Partial<CreateSectionDto> {}

// ==================== LESSON ====================
export interface CreateLessonDto {
  title: string;
  content?: string;
  type?: LessonTypeEnum;
  videoUrl?: string;
  videoDurationSeconds?: number;
  lessonOrder?: number;
  estimatedMinutes?: number;
  isPublished?: boolean;
  isFreePreview?: boolean;
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {}

// ==================== QUIZ ====================
export interface CreateQuizDto {
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  quizOrder?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  isPublished?: boolean;
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {}

// ==================== QUIZ QUESTION ====================
export interface CreateQuizQuestionDto {
  questionText: string;
  questionType?: QuizQuestionTypeEnum;
  options?: Record<string, any>[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  questionOrder?: number;
  imageUrl?: string;
}

export interface UpdateQuizQuestionDto extends Partial<CreateQuizQuestionDto> {}

// ==================== QUIZ ATTEMPT ====================
export interface SubmitQuizAttemptDto {
  answers: Record<string, any>[];
}

// ==================== LESSON PROBLEM ====================
export interface CreateLessonProblemDto {
  problemId: string;
  problemOrder?: number;
  isRequired?: boolean;
  label?: string;
}

export interface UpdateLessonProblemDto extends Partial<Omit<CreateLessonProblemDto, 'problemId'>> {}

// ==================== REVIEW ====================
export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto extends Partial<CreateReviewDto> {}

// ==================== ASSIGNMENT ====================
export interface CreateAssignmentDto {
  title: string;
  description?: string;
  type?: AssignmentTypeEnum;
  maxScore?: number;
  dueDate?: string;
  assignmentOrder?: number;
  isPublished?: boolean;
  allowedFileTypes?: string;
  maxFileSizeMb?: number;
}

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {}

// ==================== ASSIGNMENT SUBMISSION ====================
export interface CreateAssignmentSubmissionDto {
  content?: string;
}

export interface GradeSubmissionDto {
  score?: number;
  feedback?: string;
  status?: AssignmentSubmissionStatusEnum;
}
