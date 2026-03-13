import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoursesApi } from '../../../data';
import { ProblemsApi } from '../../../data';
import { ApiResponse, PaginatedResponse } from '../../../data';
import {
  CoursesModel,
  CourseSectionsModel,
  CourseLessonsModel,
  CourseEnrollmentsModel,
  CourseReviewsModel,
  CourseLessonProblemsModel,
  CourseQuizzesModel,
  CourseQuizQuestionsModel,
  CourseAssignmentsModel,
  CourseAssignmentSubmissionsModel,
} from '../../../data';
import { ProblemsModel } from '../../../data';
import {
  CreateCourseDto,
  UpdateCourseDto,
  DuplicateCourseDto,
  PaginationQueryCoursesDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateLessonProblemDto,
  UpdateLessonProblemDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateAssignmentSubmissionDto,
  GradeSubmissionDto,
} from '../../../data';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly coursesApi = inject(CoursesApi);
  private readonly problemsApi = inject(ProblemsApi);

  // Courses
  getCourses(params?: PaginationQueryCoursesDto): Observable<PaginatedResponse<CoursesModel>> { return this.coursesApi.getCourses(params); }
  getMyCourses(params?: PaginationQueryCoursesDto): Observable<PaginatedResponse<CoursesModel>> { return this.coursesApi.getMyCourses(params); }
  getCourse(courseId: string): Observable<ApiResponse<CoursesModel>> { return this.coursesApi.getCourse(courseId); }
  createCourse(dto: CreateCourseDto): Observable<ApiResponse<CoursesModel>> { return this.coursesApi.createCourse(dto); }
  updateCourse(courseId: string, dto: UpdateCourseDto): Observable<ApiResponse<CoursesModel>> { return this.coursesApi.updateCourse(courseId, dto); }
  deleteCourse(courseId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteCourse(courseId); }
  duplicateCourse(courseId: string, dto: DuplicateCourseDto): Observable<ApiResponse<CoursesModel>> { return this.coursesApi.duplicateCourse(courseId, dto); }

  // Sections
  getSections(courseId: string): Observable<ApiResponse<CourseSectionsModel[]>> { return this.coursesApi.getSections(courseId); }
  getSection(courseId: string, sectionId: string): Observable<ApiResponse<CourseSectionsModel>> { return this.coursesApi.getSection(courseId, sectionId); }
  createSection(courseId: string, dto: CreateSectionDto): Observable<ApiResponse<CourseSectionsModel>> { return this.coursesApi.createSection(courseId, dto); }
  updateSection(courseId: string, sectionId: string, dto: UpdateSectionDto): Observable<ApiResponse<CourseSectionsModel>> { return this.coursesApi.updateSection(courseId, sectionId, dto); }
  deleteSection(courseId: string, sectionId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteSection(courseId, sectionId); }

  // Lessons
  getLessons(courseId: string, sectionId: string): Observable<ApiResponse<CourseLessonsModel[]>> { return this.coursesApi.getLessons(courseId, sectionId); }
  getLesson(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonsModel>> { return this.coursesApi.getLesson(courseId, sectionId, lessonId); }
  createLesson(courseId: string, sectionId: string, dto: CreateLessonDto): Observable<ApiResponse<CourseLessonsModel>> { return this.coursesApi.createLesson(courseId, sectionId, dto); }
  updateLesson(courseId: string, sectionId: string, lessonId: string, dto: UpdateLessonDto): Observable<ApiResponse<CourseLessonsModel>> { return this.coursesApi.updateLesson(courseId, sectionId, lessonId, dto); }
  deleteLesson(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteLesson(courseId, sectionId, lessonId); }

  // Lesson Problems
  getLessonProblems(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseLessonProblemsModel[]>> { return this.coursesApi.getLessonProblems(courseId, sectionId, lessonId); }
  addProblemToLesson(courseId: string, sectionId: string, lessonId: string, dto: CreateLessonProblemDto): Observable<ApiResponse<CourseLessonProblemsModel>> { return this.coursesApi.addProblemToLesson(courseId, sectionId, lessonId, dto); }
  updateLessonProblem(courseId: string, sectionId: string, lessonId: string, problemId: string, dto: UpdateLessonProblemDto): Observable<ApiResponse<CourseLessonProblemsModel>> { return this.coursesApi.updateLessonProblem(courseId, sectionId, lessonId, problemId, dto); }
  removeProblemFromLesson(courseId: string, sectionId: string, lessonId: string, problemId: string): Observable<ApiResponse<void>> { return this.coursesApi.removeProblemFromLesson(courseId, sectionId, lessonId, problemId); }

  // Quizzes
  getQuizzes(courseId: string, sectionId: string, lessonId: string): Observable<ApiResponse<CourseQuizzesModel[]>> { return this.coursesApi.getQuizzes(courseId, sectionId, lessonId); }
  getQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizzesModel>> { return this.coursesApi.getQuiz(courseId, sectionId, lessonId, quizId); }
  createQuiz(courseId: string, sectionId: string, lessonId: string, dto: CreateQuizDto): Observable<ApiResponse<CourseQuizzesModel>> { return this.coursesApi.createQuiz(courseId, sectionId, lessonId, dto); }
  updateQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: UpdateQuizDto): Observable<ApiResponse<CourseQuizzesModel>> { return this.coursesApi.updateQuiz(courseId, sectionId, lessonId, quizId, dto); }
  deleteQuiz(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteQuiz(courseId, sectionId, lessonId, quizId); }

  // Quiz Questions
  getQuizQuestions(courseId: string, sectionId: string, lessonId: string, quizId: string): Observable<ApiResponse<CourseQuizQuestionsModel[]>> { return this.coursesApi.getQuizQuestions(courseId, sectionId, lessonId, quizId); }
  createQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, dto: CreateQuizQuestionDto): Observable<ApiResponse<CourseQuizQuestionsModel>> { return this.coursesApi.createQuizQuestion(courseId, sectionId, lessonId, quizId, dto); }
  updateQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, questionId: string, dto: UpdateQuizQuestionDto): Observable<ApiResponse<CourseQuizQuestionsModel>> { return this.coursesApi.updateQuizQuestion(courseId, sectionId, lessonId, quizId, questionId, dto); }
  deleteQuizQuestion(courseId: string, sectionId: string, lessonId: string, quizId: string, questionId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteQuizQuestion(courseId, sectionId, lessonId, quizId, questionId); }

  // Problems (for search/picker)
  searchProblems(params?: any): Observable<PaginatedResponse<ProblemsModel>> { return this.problemsApi.getProblems(params); }

  // Enrollments
  getEnrollments(courseId: string): Observable<ApiResponse<CourseEnrollmentsModel[]>> { return this.coursesApi.getEnrollments(courseId); }

  // Reviews
  getReviews(courseId: string): Observable<ApiResponse<CourseReviewsModel[]>> { return this.coursesApi.getReviews(courseId); }

  // Assignments
  getAssignments(courseId: string, lessonId: string): Observable<ApiResponse<CourseAssignmentsModel[]>> { return this.coursesApi.getAssignments(courseId, lessonId); }
  getAssignment(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentsModel>> { return this.coursesApi.getAssignment(courseId, lessonId, assignmentId); }
  createAssignment(courseId: string, lessonId: string, dto: CreateAssignmentDto, file?: File): Observable<ApiResponse<CourseAssignmentsModel>> { return this.coursesApi.createAssignment(courseId, lessonId, dto, file); }
  updateAssignment(courseId: string, lessonId: string, assignmentId: string, dto: UpdateAssignmentDto, file?: File): Observable<ApiResponse<CourseAssignmentsModel>> { return this.coursesApi.updateAssignment(courseId, lessonId, assignmentId, dto, file); }
  deleteAssignment(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteAssignment(courseId, lessonId, assignmentId); }

  // Assignment Submissions
  submitAssignment(courseId: string, lessonId: string, assignmentId: string, dto: CreateAssignmentSubmissionDto, files?: File[]): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> { return this.coursesApi.submitAssignment(courseId, lessonId, assignmentId, dto, files); }
  getSubmissions(courseId: string, lessonId: string, assignmentId: string, authorId?: string): Observable<ApiResponse<CourseAssignmentSubmissionsModel[]>> { return this.coursesApi.getSubmissions(courseId, lessonId, assignmentId, authorId); }
  getMySubmissions(courseId: string, lessonId: string, assignmentId: string): Observable<ApiResponse<CourseAssignmentSubmissionsModel[]>> { return this.coursesApi.getMySubmissions(courseId, lessonId, assignmentId); }
  gradeSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string, dto: GradeSubmissionDto): Observable<ApiResponse<CourseAssignmentSubmissionsModel>> { return this.coursesApi.gradeSubmission(courseId, lessonId, assignmentId, submissionId, dto); }
  deleteSubmission(courseId: string, lessonId: string, assignmentId: string, submissionId: string): Observable<ApiResponse<void>> { return this.coursesApi.deleteSubmission(courseId, lessonId, assignmentId, submissionId); }
}
