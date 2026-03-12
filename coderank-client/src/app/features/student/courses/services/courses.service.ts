import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoursesApi } from '../../../../data';
import { ApiResponse, PaginatedResponse } from '../../../../data';
import {
  CoursesModel,
  CourseSectionsModel,
  CourseLessonsModel,
  CourseEnrollmentsModel,
  CourseReviewsModel,
  CourseLessonProblemsModel,
  CourseQuizzesModel,
  CourseQuizQuestionsModel,
  CourseQuizAttemptsModel,
  CourseAssignmentsModel,
  CourseAssignmentSubmissionsModel,
  CourseLessonProgressModel,
  CourseProgressSummary,
} from '../../../../data';
import {
  PaginationQueryCoursesDto,
  SubmitQuizAttemptDto,
  CreateReviewDto,
  UpdateReviewDto,
  CreateAssignmentSubmissionDto,
  UpdateAssignmentSubmissionDto,
} from '../../../../data';

@Injectable({ providedIn: 'root' })
export class StudentCoursesService {
  private readonly coursesApi = inject(CoursesApi);

  // ==================== COURSES (read-only) ====================
  getCourses(params?: PaginationQueryCoursesDto): Observable<PaginatedResponse<CoursesModel>> {
    return this.coursesApi.getCourses(params);
  }

  getCourse(courseId: string): Observable<ApiResponse<CoursesModel>> {
    return this.coursesApi.getCourse(courseId);
  }

  // ==================== SECTIONS (read-only) ====================
  getSections(courseId: string): Observable<ApiResponse<CourseSectionsModel[]>> {
    return this.coursesApi.getSections(courseId);
  }

  // ==================== LESSONS (read-only) ====================
  getLessons(courseId: string, sectionId: string): Observable<ApiResponse<CourseLessonsModel[]>> {
    return this.coursesApi.getLessons(courseId, sectionId);
  }

  getLesson(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonsModel>> {
    return this.coursesApi.getLesson(courseId, sectionId, lessonId);
  }

  // ==================== LESSON PROBLEMS (read-only) ====================
  getLessonProblems(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonProblemsModel[]>> {
    return this.coursesApi.getLessonProblems(courseId, sectionId, lessonId);
  }

  // ==================== QUIZZES (read-only + attempts) ====================
  getQuizzes(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseQuizzesModel[]>> {
    return this.coursesApi.getQuizzes(courseId, sectionId, lessonId);
  }

  getQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizzesModel>> {
    return this.coursesApi.getQuiz(courseId, sectionId, lessonId, quizId);
  }

  getQuizQuestions(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizQuestionsModel[]>> {
    return this.coursesApi.getQuizQuestions(courseId, sectionId, lessonId, quizId);
  }

  submitQuizAttempt(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: SubmitQuizAttemptDto): Observable<ApiResponse<CourseQuizAttemptsModel>> {
    return this.coursesApi.submitQuizAttempt(courseId, sectionId, lessonId, quizId, dto);
  }

  getMyQuizAttempts(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizAttemptsModel[]>> {
    return this.coursesApi.getMyQuizAttempts(courseId, sectionId, lessonId, quizId);
  }

  // ==================== ENROLLMENTS ====================
  enrollCourse(courseId: string, password?: string): Observable<ApiResponse<CourseEnrollmentsModel>> {
    return this.coursesApi.enrollCourse(courseId, password ? { password } : undefined);
  }

  unenrollCourse(courseId: string): Observable<ApiResponse<void>> {
    return this.coursesApi.unenrollCourse(courseId);
  }

  getMyEnrollment(courseId: string): Observable<ApiResponse<CourseEnrollmentsModel>> {
    return this.coursesApi.getMyEnrollment(courseId);
  }

  // ==================== PROGRESS ====================
  markLessonProgress(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonProgressModel>> {
    return this.coursesApi.markLessonProgress(courseId, sectionId, lessonId);
  }

  getMyCourseProgress(courseId: string): Observable<ApiResponse<CourseProgressSummary>> {
    return this.coursesApi.getMyCourseProgress(courseId);
  }

  // ==================== REVIEWS ====================
  getReviews(courseId: string): Observable<ApiResponse<CourseReviewsModel[]>> {
    return this.coursesApi.getReviews(courseId);
  }

  createReview(courseId: string, dto: CreateReviewDto): Observable<ApiResponse<CourseReviewsModel>> {
    return this.coursesApi.createReview(courseId, dto);
  }

  updateReview(courseId: string, reviewId: string, dto: UpdateReviewDto): Observable<ApiResponse<CourseReviewsModel>> {
    return this.coursesApi.updateReview(courseId, reviewId, dto);
  }

  deleteReview(courseId: string, reviewId: string): Observable<ApiResponse<void>> {
    return this.coursesApi.deleteReview(courseId, reviewId);
  }

  // ==================== ASSIGNMENTS (read + submit) ====================
  getAssignments(courseId: string, lessonId: string): Observable<ApiResponse<CourseAssignmentsModel[]>> {
    return this.coursesApi.getAssignments(courseId, lessonId);
  }

  getAssignment(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentsModel>> {
    return this.coursesApi.getAssignment(courseId, lessonId, assignmentId);
  }

  submitAssignment(courseId: string, lessonId: string, assignmentId: string, dto: CreateAssignmentSubmissionDto, files?: File[]): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> {
    return this.coursesApi.submitAssignment(courseId, lessonId, assignmentId, dto, files);
  }

  updateSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string, dto: UpdateAssignmentSubmissionDto, files?: File[]): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> {
    return this.coursesApi.updateSubmission(courseId, lessonId, assignmentId, submissionId, dto, files);
  }

  deleteSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string): Observable<ApiResponse<void>> {
    return this.coursesApi.deleteSubmission(courseId, lessonId, assignmentId, submissionId);
  }

  getMySubmissions(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentSubmissionsModel[]>> {
    return this.coursesApi.getMySubmissions(courseId, lessonId, assignmentId);
  }
}
