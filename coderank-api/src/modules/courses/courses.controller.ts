import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from 'src/auth/decorators';
import { Owner } from 'src/auth/decorators/owner.decorator';
import { RolesEnum } from 'src/common/enums/enums';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { PaginatedResponseDto } from 'src/common/dto';

// Services
import { CoursesService } from './services/courses.service';
import { CourseSectionsService } from './services/course-sections.service';
import { CourseLessonsService } from './services/course-lessons.service';
import { CourseEnrollmentsService } from './services/course-enrollments.service';
import { CourseLessonProgressService } from './services/course-lesson-progress.service';
import { CourseQuizzesService } from './services/course-quizzes.service';
import { CourseQuizQuestionsService } from './services/course-quiz-questions.service';
import { CourseQuizAttemptsService } from './services/course-quiz-attempts.service';
import { CourseLessonProblemsService } from './services/course-lesson-problems.service';
import { CourseReviewsService } from './services/course-reviews.service';
import { CourseAssignmentsService } from './services/course-assignments.service';
import { CourseAssignmentSubmissionsService } from './services/course-assignment-submissions.service';
import { GoogleDriveService } from 'src/integrations/google/drive/google-drive.service';

// Entities
import { CoursesEntity } from './entities/courses.entity';

// DTOs
import { CreateCourseDto, UpdateCourseDto, PaginationQueryCoursesDto } from './dto/course';
import { CreateSectionDto, UpdateSectionDto } from './dto/section';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz';
import { CreateQuizQuestionDto, UpdateQuizQuestionDto } from './dto/quiz-question';
import { SubmitQuizAttemptDto } from './dto/quiz-attempt';
import { CreateLessonProblemDto, UpdateLessonProblemDto } from './dto/lesson-problem';
import { CreateReviewDto, UpdateReviewDto } from './dto/review';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment';
import { CreateSubmissionDto, GradeSubmissionDto } from './dto/assignment-submission';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly sectionsService: CourseSectionsService,
    private readonly lessonsService: CourseLessonsService,
    private readonly enrollmentsService: CourseEnrollmentsService,
    private readonly progressService: CourseLessonProgressService,
    private readonly quizzesService: CourseQuizzesService,
    private readonly quizQuestionsService: CourseQuizQuestionsService,
    private readonly quizAttemptsService: CourseQuizAttemptsService,
    private readonly lessonProblemsService: CourseLessonProblemsService,
    private readonly reviewsService: CourseReviewsService,
    private readonly assignmentsService: CourseAssignmentsService,
    private readonly assignmentSubmissionsService: CourseAssignmentSubmissionsService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  // ==================== COURSES ====================

  @Post()
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  async createCourse(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.create({
      ...dto,
      authorId: currentUser.userId,
    });
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  async getCourses(
    @Query() dto: PaginationQueryCoursesDto,
  ): Promise<PaginatedResponseDto<CoursesEntity>> {
    const { page = 1, limit = 10, search, level, status, isPublic, category, sortBy = 'createdAt', sortOrder = 'DESC' } = dto;

    const queryBuilder = this.coursesService.getRepository().createQueryBuilder('course');

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }
    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }
    if (isPublic !== undefined) {
      queryBuilder.andWhere('course.isPublic = :isPublic', { isPublic });
    }
    if (category) {
      queryBuilder.andWhere('course.category = :category', { category });
    }
    if (search) {
      queryBuilder.andWhere(
        '(course.title LIKE :search OR course.slug LIKE :search OR course.summary LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`course.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: items,
      meta: {
        totalItems,
        page,
        totalPages: Math.ceil(totalItems / limit),
        limit,
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
      path: '/courses',
    };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  async getMyCourses(
    @Query() dto: PaginationQueryCoursesDto,
    @CurrentUser() currentUser: IJwtPayload,
  ): Promise<PaginatedResponseDto<CoursesEntity>> {
    const { page = 1, limit = 10, search, level, status, sortBy = 'createdAt', sortOrder = 'DESC' } = dto;

    const queryBuilder = this.coursesService.getRepository().createQueryBuilder('course');
    queryBuilder.andWhere('course.authorId = :authorId', { authorId: currentUser.userId });

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }
    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }
    if (search) {
      queryBuilder.andWhere(
        '(course.title LIKE :search OR course.slug LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`course.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: items,
      meta: {
        totalItems,
        page,
        totalPages: Math.ceil(totalItems / limit),
        limit,
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
      path: '/courses/me',
    };
  }

  @Get(':courseId')
  @ApiBearerAuth('JWT-auth')
  async getCourse(@Param('courseId') courseId: string) {
    return this.coursesService.getRepository()
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('course.author', 'author')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.sectionOrder', 'ASC')
      .addOrderBy('lesson.lessonOrder', 'ASC')
      .select([
        'course',
        'section.id', 'section.title', 'section.description', 'section.sectionOrder', 'section.isPublished',
        'lesson.id', 'lesson.title', 'lesson.type', 'lesson.lessonOrder', 'lesson.estimatedMinutes', 'lesson.isPublished', 'lesson.isFreePreview',
        'author.id', 'author.fullName', 'author.username', 'author.avatarUrl',
      ])
      .addSelect(['course.description', 'course.learningObjectives', 'course.prerequisites'])
      .getOne();
  }

  @Patch(':courseId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(courseId, dto);
  }

  @Delete(':courseId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteCourse(@Param('courseId') courseId: string) {
    return this.coursesService.delete(courseId);
  }

  // ==================== SECTIONS ====================

  @Post(':courseId/sections')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async createSection(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create({
      ...dto,
      courseId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections')
  @ApiBearerAuth('JWT-auth')
  async getSections(@Param('courseId') courseId: string) {
    return this.sectionsService.find({
      where: { courseId },
      order: { sectionOrder: 'ASC' },
      relations: { lessons: true },
    });
  }

  @Get(':courseId/sections/:sectionId')
  @ApiBearerAuth('JWT-auth')
  async getSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.sectionsService.findOne({
      where: { id: sectionId, courseId },
      relations: { lessons: true },
    });
  }

  @Patch(':courseId/sections/:sectionId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(sectionId, dto);
  }

  @Delete(':courseId/sections/:sectionId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteSection(@Param('sectionId') sectionId: string) {
    return this.sectionsService.delete(sectionId);
  }

  // ==================== LESSONS ====================

  @Post(':courseId/sections/:sectionId/lessons')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async createLesson(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create({
      ...dto,
      sectionId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections/:sectionId/lessons')
  @ApiBearerAuth('JWT-auth')
  async getLessons(@Param('sectionId') sectionId: string) {
    return this.lessonsService.find({
      where: { sectionId },
      order: { lessonOrder: 'ASC' },
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId')
  @ApiBearerAuth('JWT-auth')
  async getLesson(
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonsService.getRepository()
      .createQueryBuilder('lesson')
      .addSelect(['lesson.content'])
      .leftJoinAndSelect('lesson.quizzes', 'quiz')
      .leftJoinAndSelect('lesson.problems', 'lessonProblem')
      .leftJoinAndSelect('lessonProblem.problem', 'problem')
      .where('lesson.id = :lessonId', { lessonId })
      .andWhere('lesson.sectionId = :sectionId', { sectionId })
      .orderBy('quiz.quizOrder', 'ASC')
      .addOrderBy('lessonProblem.problemOrder', 'ASC')
      .getOne();
  }

  @Patch(':courseId/sections/:sectionId/lessons/:lessonId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(lessonId, dto);
  }

  @Delete(':courseId/sections/:sectionId/lessons/:lessonId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsService.delete(lessonId);
  }

  // ==================== LESSON PROBLEMS ====================

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/problems')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async addProblemToLesson(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateLessonProblemDto,
  ) {
    return this.lessonProblemsService.create({
      ...dto,
      lessonId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/problems')
  @ApiBearerAuth('JWT-auth')
  async getLessonProblems(@Param('lessonId') lessonId: string) {
    return this.lessonProblemsService.find({
      where: { lessonId },
      relations: { problem: true },
      order: { problemOrder: 'ASC' },
    });
  }

  @Patch(':courseId/sections/:sectionId/lessons/:lessonId/problems/:lessonProblemId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateLessonProblem(
    @Param('lessonProblemId') lessonProblemId: string,
    @Body() dto: UpdateLessonProblemDto,
  ) {
    return this.lessonProblemsService.update(lessonProblemId, dto);
  }

  @Delete(':courseId/sections/:sectionId/lessons/:lessonId/problems/:lessonProblemId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async removeProblemFromLesson(@Param('lessonProblemId') lessonProblemId: string) {
    return this.lessonProblemsService.delete(lessonProblemId);
  }

  // ==================== QUIZZES ====================

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/quizzes')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async createQuiz(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizzesService.create({
      ...dto,
      lessonId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes')
  @ApiBearerAuth('JWT-auth')
  async getQuizzes(@Param('lessonId') lessonId: string) {
    return this.quizzesService.find({
      where: { lessonId },
      order: { quizOrder: 'ASC' },
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId')
  @ApiBearerAuth('JWT-auth')
  async getQuiz(
    @Param('lessonId') lessonId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.quizzesService.findOne({
      where: { id: quizId, lessonId },
      relations: { questions: true },
    });
  }

  @Patch(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateQuiz(
    @Param('quizId') quizId: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(quizId, dto);
  }

  @Delete(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteQuiz(@Param('quizId') quizId: string) {
    return this.quizzesService.delete(quizId);
  }

  // ==================== QUIZ QUESTIONS ====================

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async createQuizQuestion(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.create({
      ...dto,
      quizId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions')
  @ApiBearerAuth('JWT-auth')
  async getQuizQuestions(@Param('quizId') quizId: string) {
    return this.quizQuestionsService.find({
      where: { quizId },
      order: { questionOrder: 'ASC' },
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId')
  @ApiBearerAuth('JWT-auth')
  async getQuizQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizQuestionsService.getRepository()
      .createQueryBuilder('question')
      .addSelect(['question.correctAnswer', 'question.explanation'])
      .where('question.id = :questionId', { questionId })
      .andWhere('question.quizId = :quizId', { quizId })
      .getOne();
  }

  @Patch(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateQuizQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(questionId, dto);
  }

  @Delete(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteQuizQuestion(@Param('questionId') questionId: string) {
    return this.quizQuestionsService.delete(questionId);
  }

  // ==================== QUIZ ATTEMPTS ====================

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async submitQuizAttempt(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizAttemptDto,
  ) {
    // Count existing attempts
    const existingAttempts = await this.quizAttemptsService.count({
      where: { quizId, userId: currentUser.userId },
    });

    return this.quizAttemptsService.create({
      quizId,
      userId: currentUser.userId,
      answers: dto.answers,
      attemptNumber: existingAttempts + 1,
      startedAt: new Date(),
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async getMyQuizAttempts(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('quizId') quizId: string,
  ) {
    return this.quizAttemptsService.find({
      where: { quizId, userId: currentUser.userId },
      order: { attemptNumber: 'DESC' },
    });
  }

  @Get(':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts/:attemptId')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async getQuizAttempt(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('quizId') quizId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.quizAttemptsService.findOne({
      where: { id: attemptId, quizId, userId: currentUser.userId },
    });
  }

  // ==================== ENROLLMENTS ====================

  @Post(':courseId/enroll')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async enrollCourse(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.create({
      courseId,
      userId: currentUser.userId,
      enrolledAt: new Date(),
      authorId: currentUser.userId,
    });
  }

  @Delete(':courseId/enroll')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async unenrollCourse(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
  ) {
    const enrollment = await this.enrollmentsService.findOne({
      where: { courseId, userId: currentUser.userId },
    });
    if (enrollment) {
      return this.enrollmentsService.delete(enrollment.id);
    }
    return { message: 'Not enrolled' };
  }

  @Get(':courseId/enrollments')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async getEnrollments(@Param('courseId') courseId: string) {
    return this.enrollmentsService.find({
      where: { courseId },
      relations: { user: true },
      order: { enrolledAt: 'DESC' },
    });
  }

  @Get(':courseId/enrollments/me')
  @ApiBearerAuth('JWT-auth')
  async getMyEnrollment(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.findOne({
      where: { courseId, userId: currentUser.userId },
    });
  }

  // ==================== LESSON PROGRESS ====================

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/progress')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async markLessonProgress(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('lessonId') lessonId: string,
  ) {
    // Check existing progress
    const existing = await this.progressService.findOne({
      where: { lessonId, userId: currentUser.userId },
    });

    if (existing) {
      return this.progressService.update(existing.id, {
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }

    return this.progressService.create({
      lessonId,
      userId: currentUser.userId,
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/progress')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async getMyCourseProgress(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
  ) {
    // Get all sections and lessons for the course
    const sections = await this.sectionsService.find({
      where: { courseId },
      relations: { lessons: true },
    });

    const lessonIds = sections.flatMap((s) => s.lessons.map((l) => l.id));
    if (lessonIds.length === 0) {
      return { totalLessons: 0, completedLessons: 0, progressPercent: 0, lessons: [] };
    }

    const progress = await this.progressService.find({
      where: lessonIds.map((lessonId) => ({
        lessonId,
        userId: currentUser.userId,
      })),
    });

    const completedLessons = progress.filter((p) => p.isCompleted).length;
    const totalLessons = lessonIds.length;

    return {
      totalLessons,
      completedLessons,
      progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100 : 0,
      lessons: progress,
    };
  }

  // ==================== REVIEWS ====================

  @Post(':courseId/reviews')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async createReview(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create({
      ...dto,
      courseId,
      userId: currentUser.userId,
      authorId: currentUser.userId,
    });
  }

  @Get(':courseId/reviews')
  @ApiBearerAuth('JWT-auth')
  async getReviews(@Param('courseId') courseId: string) {
    return this.reviewsService.find({
      where: { courseId, isVisible: true },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch(':courseId/reviews/:reviewId')
  @ApiBearerAuth('JWT-auth')
  async updateReview(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    // Only allow the review owner to update
    const review = await this.reviewsService.findOne({
      where: { id: reviewId, userId: currentUser.userId },
    });
    if (!review) {
      return { message: 'Review not found or not owned by you' };
    }
    return this.reviewsService.update(reviewId, dto);
  }

  @Delete(':courseId/reviews/:reviewId')
  @ApiBearerAuth('JWT-auth')
  async deleteReview(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('reviewId') reviewId: string,
  ) {
    const review = await this.reviewsService.findOne({
      where: { id: reviewId, userId: currentUser.userId },
    });
    if (!review) {
      return { message: 'Review not found or not owned by you' };
    }
    return this.reviewsService.delete(reviewId);
  }

  // ==================== ASSIGNMENTS ====================

  @Post(':courseId/lessons/:lessonId/assignments')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async createAssignment(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let attachmentFileId: string | undefined;
    let attachmentFileName: string | undefined;
    let attachmentMimeType: string | undefined;
    let attachmentFileSize: number | undefined;

    if (file) {
      attachmentFileId = await this.googleDriveService.uploadFile(file);
      attachmentFileName = file.originalname;
      attachmentMimeType = file.mimetype;
      attachmentFileSize = file.size;
    }

    return this.assignmentsService.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      lessonId,
      authorId: currentUser.userId,
      attachmentFileId,
      attachmentFileName,
      attachmentMimeType,
      attachmentFileSize,
    });
  }

  @Get(':courseId/lessons/:lessonId/assignments')
  @ApiBearerAuth('JWT-auth')
  async getAssignments(@Param('lessonId') lessonId: string) {
    return this.assignmentsService.find({
      where: { lessonId },
      order: { assignmentOrder: 'ASC' },
    });
  }

  @Get(':courseId/lessons/:lessonId/assignments/:assignmentId')
  @ApiBearerAuth('JWT-auth')
  async getAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.findOne({
      where: { id: assignmentId },
      relations: ['submissions'],
    });
  }

  @Patch(':courseId/lessons/:lessonId/assignments/:assignmentId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const assignment = await this.assignmentsService.findById(assignmentId);
    if (!assignment) {
      return { message: 'Assignment not found' };
    }

    if (file) {
      // Delete old file from Google Drive if exists
      if (assignment.attachmentFileId) {
        await this.googleDriveService.deleteFile(assignment.attachmentFileId);
      }
      const attachmentFileId = await this.googleDriveService.uploadFile(file);
      return this.assignmentsService.update(assignmentId, {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        attachmentFileId,
        attachmentFileName: file.originalname,
        attachmentMimeType: file.mimetype,
        attachmentFileSize: file.size,
      });
    }

    return this.assignmentsService.update(assignmentId, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    } as any);
  }

  @Delete(':courseId/lessons/:lessonId/assignments/:assignmentId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  async deleteAssignment(@Param('assignmentId') assignmentId: string) {
    const assignment = await this.assignmentsService.findById(assignmentId);
    if (!assignment) {
      return { message: 'Assignment not found' };
    }
    // Delete attachment from Google Drive if exists
    if (assignment.attachmentFileId) {
      await this.googleDriveService.deleteFile(assignment.attachmentFileId);
    }
    return this.assignmentsService.delete(assignmentId);
  }

  // ==================== ASSIGNMENT SUBMISSIONS ====================

  @Post(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async submitAssignment(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CreateSubmissionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let submissionFileId: string | undefined;
    let submissionFileName: string | undefined;
    let submissionMimeType: string | undefined;
    let submissionFileSize: number | undefined;

    if (file) {
      submissionFileId = await this.googleDriveService.uploadFile(file);
      submissionFileName = file.originalname;
      submissionMimeType = file.mimetype;
      submissionFileSize = file.size;
    }

    // Count existing submissions for attempt number
    const existingCount = await this.assignmentSubmissionsService.count({
      where: { assignmentId, authorId: currentUser.userId },
    });

    return this.assignmentSubmissionsService.create({
      ...dto,
      assignmentId,
      authorId: currentUser.userId,
      submissionFileId,
      submissionFileName,
      submissionMimeType,
      submissionFileSize,
      attemptNumber: existingCount + 1,
      submittedAt: new Date(),
    });
  }

  @Get(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions')
  @ApiBearerAuth('JWT-auth')
  async getSubmissions(
    @Param('assignmentId') assignmentId: string,
    @Query('authorId') authorId?: string,
  ) {
    const where: any = { assignmentId };
    if (authorId) where.authorId = authorId;
    return this.assignmentSubmissionsService.find({
      where,
      order: { submittedAt: 'DESC' },
    });
  }

  @Get(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/me')
  @ApiBearerAuth('JWT-auth')
  async getMySubmissions(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentSubmissionsService.find({
      where: { assignmentId, authorId: currentUser.userId },
      order: { submittedAt: 'DESC' },
    });
  }

  @Patch(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId/grade')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentSubmissionsService.update(submissionId, {
      ...dto,
      gradedAt: new Date(),
    });
  }

  @Delete(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId')
  @ApiBearerAuth('JWT-auth')
  async deleteSubmission(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('submissionId') submissionId: string,
  ) {
    const submission =
      await this.assignmentSubmissionsService.findById(submissionId);
    if (!submission) {
      return { message: 'Submission not found' };
    }
    // Delete file from Google Drive if exists
    if (submission.submissionFileId) {
      await this.googleDriveService.deleteFile(submission.submissionFileId);
    }
    return this.assignmentSubmissionsService.delete(submissionId);
  }
}