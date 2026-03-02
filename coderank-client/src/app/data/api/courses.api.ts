import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from './base.api';
import { ApiResponse, PaginatedResponse } from '../interfaces';
import {
  CoursesModel,
  CourseSectionsModel,
  CourseLessonsModel,
  CourseEnrollmentsModel,
  CourseLessonProgressModel,
  CourseQuizzesModel,
  CourseQuizQuestionsModel,
  CourseQuizAttemptsModel,
  CourseLessonProblemsModel,
  CourseReviewsModel,
  CourseProgressSummary,
  CourseAssignmentsModel,
  CourseAssignmentSubmissionsModel,
} from '../models/courses.model';
import {
  CreateCourseDto,
  UpdateCourseDto,
  PaginationQueryCoursesDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  SubmitQuizAttemptDto,
  CreateLessonProblemDto,
  UpdateLessonProblemDto,
  CreateReviewDto,
  UpdateReviewDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateAssignmentSubmissionDto,
  UpdateAssignmentSubmissionDto,
  GradeSubmissionDto,
} from '../dto/courses';

@Injectable({ providedIn: 'root' })
export class CoursesApi extends BaseApi {
  protected readonly endpoint = '/courses';

  // ==================== COURSES ====================

  createCourse(dto: CreateCourseDto): Observable<ApiResponse<CoursesModel>> {
    return this.apiService.post<ApiResponse<CoursesModel>>(this.endpoint, dto);
  }

  getCourses(params?: PaginationQueryCoursesDto): Observable<PaginatedResponse<CoursesModel>> {
    return this.apiService.get<PaginatedResponse<CoursesModel>>(this.endpoint, this.buildParams(params));
  }

  getMyCourses(params?: PaginationQueryCoursesDto): Observable<PaginatedResponse<CoursesModel>> {
    return this.apiService.get<PaginatedResponse<CoursesModel>>(this.getUrl('/me'), this.buildParams(params));
  }

  getCourse(courseId: string): Observable<ApiResponse<CoursesModel>> {
    return this.apiService.get<ApiResponse<CoursesModel>>(this.getUrl(`/${courseId}`));
  }

  updateCourse(courseId: string, dto: UpdateCourseDto): Observable<ApiResponse<CoursesModel>> {
    return this.apiService.patch<ApiResponse<CoursesModel>>(this.getUrl(`/${courseId}`), dto);
  }

  deleteCourse(courseId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}`));
  }

  // ==================== SECTIONS ====================

  createSection(courseId: string, dto: CreateSectionDto): Observable<ApiResponse<CourseSectionsModel>> {
    return this.apiService.post<ApiResponse<CourseSectionsModel>>(this.getUrl(`/${courseId}/sections`), dto);
  }

  getSections(courseId: string): Observable<ApiResponse<CourseSectionsModel[]>> {
    return this.apiService.get<ApiResponse<CourseSectionsModel[]>>(this.getUrl(`/${courseId}/sections`));
  }

  getSection(courseId: string, sectionId: string): Observable<ApiResponse<CourseSectionsModel>> {
    return this.apiService.get<ApiResponse<CourseSectionsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}`));
  }

  updateSection(courseId: string, sectionId: string, dto: UpdateSectionDto): Observable<ApiResponse<CourseSectionsModel>> {
    return this.apiService.patch<ApiResponse<CourseSectionsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}`), dto);
  }

  deleteSection(courseId: string, sectionId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/sections/${sectionId}`));
  }

  // ==================== LESSONS ====================

  createLesson(courseId: string, sectionId: string, dto: CreateLessonDto): Observable<ApiResponse<CourseLessonsModel>> {
    return this.apiService.post<ApiResponse<CourseLessonsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons`), dto);
  }

  getLessons(courseId: string, sectionId: string): Observable<ApiResponse<CourseLessonsModel[]>> {
    return this.apiService.get<ApiResponse<CourseLessonsModel[]>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons`));
  }

  getLesson(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonsModel>> {
    return this.apiService.get<ApiResponse<CourseLessonsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}`));
  }

  updateLesson(courseId: string, sectionId: string, lessonId: string, dto: UpdateLessonDto): Observable<ApiResponse<CourseLessonsModel>> {
    return this.apiService.patch<ApiResponse<CourseLessonsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}`), dto);
  }

  deleteLesson(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}`));
  }

  // ==================== LESSON PROBLEMS ====================

  addProblemToLesson(courseId: string, sectionId: string, lessonId: string, dto: CreateLessonProblemDto): Observable<ApiResponse<CourseLessonProblemsModel>> {
    return this.apiService.post<ApiResponse<CourseLessonProblemsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/problems`), dto);
  }

  getLessonProblems(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonProblemsModel[]>> {
    return this.apiService.get<ApiResponse<CourseLessonProblemsModel[]>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/problems`));
  }

  updateLessonProblem(courseId: string, sectionId: string, lessonId: string, lessonProblemId: string, dto: UpdateLessonProblemDto): Observable<ApiResponse<CourseLessonProblemsModel>> {
    return this.apiService.patch<ApiResponse<CourseLessonProblemsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/problems/${lessonProblemId}`), dto);
  }

  removeProblemFromLesson(courseId: string, sectionId: string, lessonId: string, lessonProblemId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/problems/${lessonProblemId}`));
  }

  // ==================== QUIZZES ====================

  createQuiz(courseId: string, sectionId: string, lessonId: string, dto: CreateQuizDto): Observable<ApiResponse<CourseQuizzesModel>> {
    return this.apiService.post<ApiResponse<CourseQuizzesModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes`), dto);
  }

  getQuizzes(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseQuizzesModel[]>> {
    return this.apiService.get<ApiResponse<CourseQuizzesModel[]>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes`));
  }

  getQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizzesModel>> {
    return this.apiService.get<ApiResponse<CourseQuizzesModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}`));
  }

  updateQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: UpdateQuizDto): Observable<ApiResponse<CourseQuizzesModel>> {
    return this.apiService.patch<ApiResponse<CourseQuizzesModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}`), dto);
  }

  deleteQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}`));
  }

  // ==================== QUIZ QUESTIONS ====================

  createQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: CreateQuizQuestionDto): Observable<ApiResponse<CourseQuizQuestionsModel>> {
    return this.apiService.post<ApiResponse<CourseQuizQuestionsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/questions`), dto);
  }

  getQuizQuestions(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizQuestionsModel[]>> {
    return this.apiService.get<ApiResponse<CourseQuizQuestionsModel[]>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/questions`));
  }

  getQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, questionId: string): Observable<ApiResponse<CourseQuizQuestionsModel>> {
    return this.apiService.get<ApiResponse<CourseQuizQuestionsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/questions/${questionId}`));
  }

  updateQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, questionId: string, dto: UpdateQuizQuestionDto): Observable<ApiResponse<CourseQuizQuestionsModel>> {
    return this.apiService.patch<ApiResponse<CourseQuizQuestionsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/questions/${questionId}`), dto);
  }

  deleteQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, questionId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/questions/${questionId}`));
  }

  // ==================== QUIZ ATTEMPTS ====================

  submitQuizAttempt(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: SubmitQuizAttemptDto): Observable<ApiResponse<CourseQuizAttemptsModel>> {
    return this.apiService.post<ApiResponse<CourseQuizAttemptsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/attempts`), dto);
  }

  getMyQuizAttempts(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizAttemptsModel[]>> {
    return this.apiService.get<ApiResponse<CourseQuizAttemptsModel[]>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/attempts`));
  }

  getQuizAttempt(courseId: string, sectionId: string, lessonId: string, quizId: string, attemptId: string): Observable<ApiResponse<CourseQuizAttemptsModel>> {
    return this.apiService.get<ApiResponse<CourseQuizAttemptsModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/quizzes/${quizId}/attempts/${attemptId}`));
  }

  // ==================== ENROLLMENTS ====================

  enrollCourse(courseId: string, body?: { password?: string }): Observable<ApiResponse<CourseEnrollmentsModel>> {
    return this.apiService.post<ApiResponse<CourseEnrollmentsModel>>(this.getUrl(`/${courseId}/enroll`), body || {});
  }

  unenrollCourse(courseId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/enroll`));
  }

  getEnrollments(courseId: string): Observable<ApiResponse<CourseEnrollmentsModel[]>> {
    return this.apiService.get<ApiResponse<CourseEnrollmentsModel[]>>(this.getUrl(`/${courseId}/enrollments`));
  }

  getMyEnrollment(courseId: string): Observable<ApiResponse<CourseEnrollmentsModel>> {
    return this.apiService.get<ApiResponse<CourseEnrollmentsModel>>(this.getUrl(`/${courseId}/enrollments/me`));
  }

  // ==================== LESSON PROGRESS ====================

  markLessonProgress(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonProgressModel>> {
    return this.apiService.post<ApiResponse<CourseLessonProgressModel>>(this.getUrl(`/${courseId}/sections/${sectionId}/lessons/${lessonId}/progress`), {});
  }

  getMyCourseProgress(courseId: string): Observable<ApiResponse<CourseProgressSummary>> {
    return this.apiService.get<ApiResponse<CourseProgressSummary>>(this.getUrl(`/${courseId}/progress`));
  }

  // ==================== REVIEWS ====================

  createReview(courseId: string, dto: CreateReviewDto): Observable<ApiResponse<CourseReviewsModel>> {
    return this.apiService.post<ApiResponse<CourseReviewsModel>>(this.getUrl(`/${courseId}/reviews`), dto);
  }

  getReviews(courseId: string): Observable<ApiResponse<CourseReviewsModel[]>> {
    return this.apiService.get<ApiResponse<CourseReviewsModel[]>>(this.getUrl(`/${courseId}/reviews`));
  }

  updateReview(courseId: string, reviewId: string, dto: UpdateReviewDto): Observable<ApiResponse<CourseReviewsModel>> {
    return this.apiService.patch<ApiResponse<CourseReviewsModel>>(this.getUrl(`/${courseId}/reviews/${reviewId}`), dto);
  }

  deleteReview(courseId: string, reviewId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/reviews/${reviewId}`));
  }

  // ==================== ASSIGNMENTS ====================

  createAssignment(courseId: string, lessonId: string, dto: CreateAssignmentDto, file?: File): Observable<ApiResponse<CourseAssignmentsModel>> {
    if (file) {
      return this.apiService.upload<ApiResponse<CourseAssignmentsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments`), file, dto);
    }
    return this.apiService.post<ApiResponse<CourseAssignmentsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments`), dto);
  }

  getAssignments(courseId: string, lessonId: string): Observable<ApiResponse<CourseAssignmentsModel[]>> {
    return this.apiService.get<ApiResponse<CourseAssignmentsModel[]>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments`));
  }

  getAssignment(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentsModel>> {
    return this.apiService.get<ApiResponse<CourseAssignmentsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}`));
  }

  updateAssignment(courseId: string, lessonId: string, assignmentId: string, dto: UpdateAssignmentDto, file?: File): Observable<ApiResponse<CourseAssignmentsModel>> {
    if (file) {
      return this.apiService.uploadPatch<ApiResponse<CourseAssignmentsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}`), file, dto);
    }
    return this.apiService.patch<ApiResponse<CourseAssignmentsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}`), dto);
  }

  deleteAssignment(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}`));
  }

  // ==================== ASSIGNMENT SUBMISSIONS ====================

  submitAssignment(courseId: string, lessonId: string, assignmentId: string, dto: CreateAssignmentSubmissionDto, files?: File[]): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> {
    if (files && files.length > 0) {
      return this.apiService.uploadMultiple<ApiResponse<CourseAssignmentSubmissionsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions`), files, dto);
    }
    return this.apiService.post<ApiResponse<CourseAssignmentSubmissionsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions`), dto);
  }

  getSubmissions(courseId: string, lessonId: string, assignmentId: string, authorId?: string): Observable<ApiResponse<CourseAssignmentSubmissionsModel[]>> {
    const params = authorId ? { authorId } : {};
    return this.apiService.get<ApiResponse<CourseAssignmentSubmissionsModel[]>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions`), params);
  }

  getMySubmissions(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentSubmissionsModel[]>> {
    return this.apiService.get<ApiResponse<CourseAssignmentSubmissionsModel[]>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/me`));
  }

  gradeSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string, dto: GradeSubmissionDto): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> {
    return this.apiService.patch<ApiResponse<CourseAssignmentSubmissionsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}/grade`), dto);
  }

  updateSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string, dto: UpdateAssignmentSubmissionDto, files?: File[]): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> {
    if (files && files.length > 0) {
      return this.apiService.uploadPatchMultiple<ApiResponse<CourseAssignmentSubmissionsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}`), files, dto);
    }
    return this.apiService.patch<ApiResponse<CourseAssignmentSubmissionsModel>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}`), dto);
  }

  deleteSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(this.getUrl(`/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}`));
  }
}
