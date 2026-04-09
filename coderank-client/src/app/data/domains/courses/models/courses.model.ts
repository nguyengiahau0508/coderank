import { AssignmentSubmissionStatusEnum, AssignmentTypeEnum, BaseModel, CourseLevelEnum, CourseStatusEnum, EnrollmentStatusEnum, LessonTypeEnum, QuizQuestionTypeEnum } from "../../../shared";
import { UsersModel } from "../../users/models/users.model";
import { ProblemsModel } from "../../problems/models/problems.model";

export interface CoursesModel extends BaseModel {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  level: CourseLevelEnum;
  status: CourseStatusEnum;
  isPublic: boolean;
  password: string | null;
  maxStudents: number;
  estimatedDurationMinutes: number | null;
  tags: string | null;
  category: string | null;
  learningObjectives: string | null;
  prerequisites: string | null;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  author?: UsersModel;
  sections?: CourseSectionsModel[];
  enrollments?: CourseEnrollmentsModel[];
  reviews?: CourseReviewsModel[];
  // Embedded enrollment info (from /enrolled endpoint)
  enrollment?: {
    id: string;
    status: EnrollmentStatusEnum;
    enrolledAt: Date | null;
    completedAt: Date | null;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: Date | null;
    certificateIssuedAt: Date | null;
  };
}

export interface CourseSectionsModel extends BaseModel {
  courseId: string;
  title: string;
  description: string | null;
  sectionOrder: number;
  isPublished: boolean;
  course?: CoursesModel;
  lessons?: CourseLessonsModel[];
}

export interface CourseLessonsModel extends BaseModel {
  sectionId: string;
  title: string;
  content: string | null;
  type: LessonTypeEnum;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  lessonOrder: number;
  estimatedMinutes: number | null;
  isPublished: boolean;
  isFreePreview: boolean;
  section?: CourseSectionsModel;
  quizzes?: CourseQuizzesModel[];
  problems?: CourseLessonProblemsModel[];
  assignments?: CourseAssignmentsModel[];
}

export interface CourseEnrollmentsModel extends BaseModel {
  courseId: string;
  userId: string;
  status: EnrollmentStatusEnum;
  enrolledAt: Date | null;
  completedAt: Date | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: Date | null;
  certificateIssuedAt: Date | null;
  course?: CoursesModel;
  user?: UsersModel;
}

export interface CourseLessonProgressModel extends BaseModel {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  timeSpentSeconds: number;
  notes: string | null;
  lesson?: CourseLessonsModel;
  user?: UsersModel;
}

export interface CourseQuizzesModel extends BaseModel {
  lessonId: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  passingScore: number;
  maxAttempts: number;
  quizOrder: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  isPublished: boolean;
  lesson?: CourseLessonsModel;
  questions?: CourseQuizQuestionsModel[];
  attempts?: CourseQuizAttemptsModel[];
}

export interface CourseQuizQuestionsModel extends BaseModel {
  quizId: string;
  questionText: string;
  questionType: QuizQuestionTypeEnum;
  options: Record<string, any>[] | null;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  questionOrder: number;
  imageUrl: string | null;
  quiz?: CourseQuizzesModel;
}

export interface CourseQuizAttemptsModel extends BaseModel {
  quizId: string;
  userId: string;
  score: number;
  pointsEarned: number;
  totalPoints: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  timeTakenSeconds: number | null;
  answers: Record<string, any>[] | null;
  attemptNumber: number;
  quiz?: CourseQuizzesModel;
  user?: UsersModel;
}

export interface CourseLessonProblemsModel extends BaseModel {
  lessonId: string;
  problemId: string;
  problemOrder: number;
  isRequired: boolean;
  label: string | null;
  lesson?: CourseLessonsModel;
  problem?: ProblemsModel;
}

export interface CourseReviewsModel extends BaseModel {
  courseId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  course?: CoursesModel;
  user?: UsersModel;
}

export interface CourseProgressSummary {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: CourseLessonProgressModel[];
}

export interface CourseAssignmentsModel extends BaseModel {
  lessonId: string;
  title: string;
  description: string | null;
  type: AssignmentTypeEnum;
  attachmentFileId: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  attachmentFileSize: number | null;
  maxScore: number;
  dueDate: string | null;
  assignmentOrder: number;
  isPublished: boolean;
  allowedFileTypes: string | null;
  maxFileSizeMb: number;
  gradingCriteria: AssignmentGradingCriterion[] | null;
  lesson?: CourseLessonsModel;
  submissions?: CourseAssignmentSubmissionsModel[];
}

export interface AssignmentGradingCriterion {
  criterion: string;
  description?: string;
  maxScore: number;
}

export interface SubmissionFileInfo {
  fileId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface AssignmentAiGradingCriterionScore {
  criterion: string;
  maxScore: number;
  score: number;
  feedback?: string;
}

export interface AssignmentAiGradingResult {
  rubricUsed: AssignmentGradingCriterion[];
  criterionScores?: AssignmentAiGradingCriterionScore[];
  score: number;
  maxScore: number;
  percentageScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidence: number;
  evaluatedFileCount: number;
  generatedAt: string;
  graderProvider?: string;
  graderModel?: string;
  error?: string;
}

export interface SubmissionSimilarityMatch {
  submissionId: string;
  authorId: string;
  similarity: number;
}

export interface CourseAssignmentSubmissionsModel extends BaseModel {
  assignmentId: string;
  content: string | null;
  submissionFiles: SubmissionFileInfo[] | null;
  status: AssignmentSubmissionStatusEnum;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  attemptNumber: number;
  submittedAt: string;
  aiGradingResult: AssignmentAiGradingResult | null;
  isSimilarityFlagged: boolean;
  similarityMatches: SubmissionSimilarityMatch[] | null;
  maxSimilarityScore: number | null;
  assignment?: CourseAssignmentsModel;
  author?: Pick<UsersModel, 'id' | 'fullName' | 'username' | 'email'> | null;
}
