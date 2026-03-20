import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from 'src/auth/decorators';
import { Owner } from 'src/auth/decorators/owner.decorator';
import { RolesEnum, EnrollmentStatusEnum } from 'src/common/enums/enums';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import type { Response } from 'express';
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
import { LocalStorageService } from 'src/integrations/local-storage/local-storage.service';

// Entities
import { CoursesEntity } from './entities/courses.entity';
import { CourseSectionsEntity } from './entities/course-sections.entity';
import { CourseLessonsEntity } from './entities/course-lessons.entity';
import { CourseQuizzesEntity } from './entities/course-quizzes.entity';
import { CourseQuizQuestionsEntity } from './entities/course-quiz-questions.entity';
import { CourseLessonProblemsEntity } from './entities/course-lesson-problems.entity';
import { CourseAssignmentsEntity } from './entities/course-assignments.entity';

// DTOs
import {
  CreateCourseDto,
  UpdateCourseDto,
  PaginationQueryCoursesDto,
  DuplicateCourseDto,
} from './dto/course';
import { CreateSectionDto, UpdateSectionDto } from './dto/section';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from './dto/quiz-question';
import { SubmitQuizAttemptDto } from './dto/quiz-attempt';
import {
  CreateLessonProblemDto,
  UpdateLessonProblemDto,
} from './dto/lesson-problem';
import { CreateReviewDto, UpdateReviewDto } from './dto/review';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment';
import {
  CreateSubmissionDto,
  UpdateSubmissionDto,
  GradeSubmissionDto,
} from './dto/assignment-submission';
import { EnrollCourseDto } from './dto/enrollment';

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
    private readonly localStorageService: LocalStorageService,
  ) {}

  /**
   * Recalculate averageRating & reviewCount for a course
   */
  private async recalculateCourseRating(courseId: string): Promise<void> {
    const result = await this.reviewsService
      .getRepository()
      .createQueryBuilder('r')
      .select('COUNT(r.id)', 'cnt')
      .addSelect('COALESCE(AVG(r.rating), 0)', 'avg')
      .where('r.courseId = :courseId', { courseId })
      .andWhere('r.isVisible = true')
      .getRawOne();

    await this.coursesService.update(courseId, {
      reviewCount: parseInt(result.cnt, 10) || 0,
      averageRating: parseFloat(parseFloat(result.avg).toFixed(2)) || 0,
    });
  }

  /**
   * Recalculate enrollmentCount for a course (only active enrollments)
   */
  private async recalculateEnrollmentCount(courseId: string): Promise<void> {
    const count = await this.enrollmentsService.getRepository().count({
      where: { courseId, status: EnrollmentStatusEnum.Active } as any,
    });

    await this.coursesService.update(courseId, {
      enrollmentCount: count,
    });
  }

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
    const {
      page = 1,
      limit = 10,
      search,
      level,
      status,
      isPublic,
      category,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    const queryBuilder = this.coursesService
      .getRepository()
      .createQueryBuilder('course');

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
    const {
      page = 1,
      limit = 10,
      search,
      level,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    const queryBuilder = this.coursesService
      .getRepository()
      .createQueryBuilder('course');
    queryBuilder.andWhere('course.authorId = :authorId', {
      authorId: currentUser.userId,
    });

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

  @Get('enrolled')
  @ApiBearerAuth('JWT-auth')
  async getEnrolledCourses(
    @Query() dto: PaginationQueryCoursesDto,
    @CurrentUser() currentUser: IJwtPayload,
  ): Promise<PaginatedResponseDto<CoursesEntity>> {
    const {
      page = 1,
      limit = 10,
      search,
      level,
      status: enrollmentStatus,
      sortBy = 'enrolledAt',
      sortOrder = 'DESC',
    } = dto;

    const queryBuilder = this.enrollmentsService
      .getRepository()
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.author', 'author')
      .where('enrollment.userId = :userId', { userId: currentUser.userId });

    // Filter by enrollment status (active, completed, dropped)
    if (enrollmentStatus) {
      queryBuilder.andWhere('enrollment.status = :enrollmentStatus', { enrollmentStatus });
    } else {
      // Default: only show active enrollments
      queryBuilder.andWhere('enrollment.status = :status', { status: EnrollmentStatusEnum.Active });
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

    // Sort by enrollment fields or course fields
    const enrollmentFields = ['enrolledAt', 'completedAt', 'progressPercent', 'lastAccessedAt'];
    if (enrollmentFields.includes(sortBy)) {
      queryBuilder.orderBy(`enrollment.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy(`course.${sortBy}`, sortOrder);
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [enrollments, totalItems] = await queryBuilder.getManyAndCount();

    // Map enrollments to include course with enrollment info
    const items = enrollments.map((e) => ({
      ...e.course,
      enrollment: {
        id: e.id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        progressPercent: e.progressPercent,
        completedLessons: e.completedLessons,
        totalLessons: e.totalLessons,
        lastAccessedAt: e.lastAccessedAt,
        certificateIssuedAt: e.certificateIssuedAt,
      },
    }));

    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: items as any,
      meta: {
        totalItems,
        page,
        totalPages: Math.ceil(totalItems / limit),
        limit,
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
      path: '/courses/enrolled',
    };
  }

  @Get(':courseId')
  @ApiBearerAuth('JWT-auth')
  async getCourse(@Param('courseId') courseId: string) {
    return this.coursesService
      .getRepository()
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('course.author', 'author')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.sectionOrder', 'ASC')
      .addOrderBy('lesson.lessonOrder', 'ASC')
      .select([
        'course',
        'section.id',
        'section.title',
        'section.description',
        'section.sectionOrder',
        'section.isPublished',
        'lesson.id',
        'lesson.title',
        'lesson.type',
        'lesson.lessonOrder',
        'lesson.estimatedMinutes',
        'lesson.isPublished',
        'lesson.isFreePreview',
        'author.id',
        'author.fullName',
        'author.username',
        'author.avatarUrl',
      ])
      .addSelect([
        'course.description',
        'course.learningObjectives',
        'course.prerequisites',
      ])
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

  @Post(':courseId/duplicate')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async duplicateCourse(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: DuplicateCourseDto,
  ) {
    // 1. Load the source course with all nested content
    const source = await this.coursesService
      .getRepository()
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.quizzes', 'quiz')
      .leftJoinAndSelect('quiz.questions', 'question')
      .leftJoinAndSelect('lesson.problems', 'lessonProblem')
      .leftJoinAndSelect('lesson.assignments', 'assignment')
      .addSelect([
        'course.description',
        'course.learningObjectives',
        'course.prerequisites',
        'course.password',
      ])
      .addSelect(['lesson.content'])
      .addSelect(['question.correctAnswer', 'question.explanation'])
      .where('course.id = :courseId', { courseId })
      .andWhere('course.authorId = :authorId', { authorId: currentUser.userId })
      .orderBy('section.sectionOrder', 'ASC')
      .addOrderBy('lesson.lessonOrder', 'ASC')
      .addOrderBy('quiz.quizOrder', 'ASC')
      .addOrderBy('question.questionOrder', 'ASC')
      .addOrderBy('assignment.assignmentOrder', 'ASC')
      .getOne();

    if (!source) {
      throw new NotFoundException(
        'Không tìm thấy khóa học hoặc bạn không phải là chủ sở hữu',
      );
    }

    // 2. Duplicate inside a transaction
    return this.coursesService.transaction(async (manager) => {
      // Create new course
      const newCourse = manager.create(CoursesEntity, {
        title: dto.title,
        slug: dto.slug,
        summary: source.summary,
        description: source.description,
        thumbnailUrl: source.thumbnailUrl,
        level: source.level,
        status: 'draft' as any,
        isPublic: source.isPublic,
        password: source.password,
        maxStudents: source.maxStudents,
        estimatedDurationMinutes: source.estimatedDurationMinutes,
        tags: source.tags,
        category: source.category,
        learningObjectives: source.learningObjectives,
        prerequisites: source.prerequisites,
        enrollmentCount: 0,
        averageRating: 0,
        reviewCount: 0,
        authorId: currentUser.userId,
      });
      const savedCourse = await manager.save(CoursesEntity, newCourse);

      // Duplicate sections
      for (const section of source.sections || []) {
        const newSection = manager.create(CourseSectionsEntity, {
          courseId: savedCourse.id,
          title: section.title,
          description: section.description,
          sectionOrder: section.sectionOrder,
          isPublished: false,
          authorId: currentUser.userId,
        });
        const savedSection = await manager.save(
          CourseSectionsEntity,
          newSection,
        );

        // Duplicate lessons
        for (const lesson of section.lessons || []) {
          const newLesson = manager.create(CourseLessonsEntity, {
            sectionId: savedSection.id,
            title: lesson.title,
            content: lesson.content,
            type: lesson.type,
            videoUrl: lesson.videoUrl,
            videoDurationSeconds: lesson.videoDurationSeconds,
            lessonOrder: lesson.lessonOrder,
            estimatedMinutes: lesson.estimatedMinutes,
            isPublished: false,
            isFreePreview: lesson.isFreePreview,
            authorId: currentUser.userId,
          });
          const savedLesson = await manager.save(
            CourseLessonsEntity,
            newLesson,
          );

          // Duplicate quizzes + questions
          for (const quiz of lesson.quizzes || []) {
            const newQuiz = manager.create(CourseQuizzesEntity, {
              lessonId: savedLesson.id,
              title: quiz.title,
              description: quiz.description,
              timeLimitMinutes: quiz.timeLimitMinutes,
              passingScore: quiz.passingScore,
              maxAttempts: quiz.maxAttempts,
              quizOrder: quiz.quizOrder,
              shuffleQuestions: quiz.shuffleQuestions,
              showCorrectAnswers: quiz.showCorrectAnswers,
              isPublished: false,
              authorId: currentUser.userId,
            });
            const savedQuiz = await manager.save(CourseQuizzesEntity, newQuiz);

            // Duplicate quiz questions
            for (const question of quiz.questions || []) {
              const newQuestion = manager.create(CourseQuizQuestionsEntity, {
                quizId: savedQuiz.id,
                questionText: question.questionText,
                questionType: question.questionType,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                points: question.points,
                questionOrder: question.questionOrder,
                imageUrl: question.imageUrl,
                authorId: currentUser.userId,
              });
              await manager.save(CourseQuizQuestionsEntity, newQuestion);
            }
          }

          // Duplicate lesson problems
          for (const prob of lesson.problems || []) {
            const newProblem = manager.create(CourseLessonProblemsEntity, {
              lessonId: savedLesson.id,
              problemId: prob.problemId,
              problemOrder: prob.problemOrder,
              isRequired: prob.isRequired,
              label: prob.label,
              authorId: currentUser.userId,
            });
            await manager.save(CourseLessonProblemsEntity, newProblem);
          }

          // Duplicate assignments (without submissions)
          for (const assignment of lesson.assignments || []) {
            const newAssignment = manager.create(CourseAssignmentsEntity, {
              lessonId: savedLesson.id,
              title: assignment.title,
              description: assignment.description,
              type: assignment.type,
              attachmentFileId: assignment.attachmentFileId,
              attachmentFileName: assignment.attachmentFileName,
              attachmentMimeType: assignment.attachmentMimeType,
              attachmentFileSize: assignment.attachmentFileSize,
              maxScore: assignment.maxScore,
              dueDate: null,
              assignmentOrder: assignment.assignmentOrder,
              isPublished: false,
              allowedFileTypes: assignment.allowedFileTypes,
              maxFileSizeMb: assignment.maxFileSizeMb,
              authorId: currentUser.userId,
            });
            await manager.save(CourseAssignmentsEntity, newAssignment);
          }
        }
      }

      return savedCourse;
    });
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
    return this.lessonsService
      .getRepository()
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

  @Patch(
    ':courseId/sections/:sectionId/lessons/:lessonId/problems/:lessonProblemId',
  )
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateLessonProblem(
    @Param('lessonProblemId') lessonProblemId: string,
    @Body() dto: UpdateLessonProblemDto,
  ) {
    return this.lessonProblemsService.update(lessonProblemId, dto);
  }

  @Delete(
    ':courseId/sections/:sectionId/lessons/:lessonId/problems/:lessonProblemId',
  )
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async removeProblemFromLesson(
    @Param('lessonProblemId') lessonProblemId: string,
  ) {
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

  @Post(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions',
  )
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

  @Get(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions',
  )
  @ApiBearerAuth('JWT-auth')
  async getQuizQuestions(@Param('quizId') quizId: string) {
    return this.quizQuestionsService.find({
      where: { quizId },
      order: { questionOrder: 'ASC' },
    });
  }

  @Get(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId',
  )
  @ApiBearerAuth('JWT-auth')
  async getQuizQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizQuestionsService
      .getRepository()
      .createQueryBuilder('question')
      .addSelect(['question.correctAnswer', 'question.explanation'])
      .where('question.id = :questionId', { questionId })
      .andWhere('question.quizId = :quizId', { quizId })
      .getOne();
  }

  @Patch(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId',
  )
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async updateQuizQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(questionId, dto);
  }

  @Delete(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId',
  )
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(CoursesEntity, 'authorId', 'courseId')
  @ApiBearerAuth('JWT-auth')
  async deleteQuizQuestion(@Param('questionId') questionId: string) {
    return this.quizQuestionsService.delete(questionId);
  }

  // ==================== QUIZ ATTEMPTS ====================

  @Post(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts',
  )
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

  @Get(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts',
  )
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

  @Get(
    ':courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts/:attemptId',
  )
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
    @Body() dto: EnrollCourseDto,
  ) {
    // Check if course is private and requires password
    const course = await this.coursesService.findOne({
      where: { id: courseId },
      select: ['id', 'isPublic', 'password'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (!course.isPublic) {
      if (!dto.password) {
        throw new BadRequestException(
          'Khóa học riêng tư yêu cầu mật khẩu để đăng ký',
        );
      }
      if (dto.password !== course.password) {
        throw new BadRequestException('Mật khẩu không chính xác');
      }
    }
    const enrollment = await this.enrollmentsService.create({
      courseId,
      userId: currentUser.userId,
      enrolledAt: new Date(),
      authorId: currentUser.userId,
    });
    await this.recalculateEnrollmentCount(courseId);
    return enrollment;
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
      const result = await this.enrollmentsService.delete(enrollment.id);
      await this.recalculateEnrollmentCount(courseId);
      return result;
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
      return {
        totalLessons: 0,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [],
      };
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
      progressPercent:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
          : 0,
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
    const review = await this.reviewsService.create({
      ...dto,
      courseId,
      userId: currentUser.userId,
      authorId: currentUser.userId,
    });
    await this.recalculateCourseRating(courseId);
    return review;
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
    @Param('courseId') courseId: string,
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
    const updated = await this.reviewsService.update(reviewId, dto);
    await this.recalculateCourseRating(courseId);
    return updated;
  }

  @Delete(':courseId/reviews/:reviewId')
  @ApiBearerAuth('JWT-auth')
  async deleteReview(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('courseId') courseId: string,
    @Param('reviewId') reviewId: string,
  ) {
    const review = await this.reviewsService.findOne({
      where: { id: reviewId, userId: currentUser.userId },
    });
    if (!review) {
      return { message: 'Review not found or not owned by you' };
    }
    const result = await this.reviewsService.delete(reviewId);
    await this.recalculateCourseRating(courseId);
    return result;
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
      const uploaded = await this.localStorageService.uploadFile(
        file,
        'assignments',
      );
      attachmentFileId = uploaded.filePath;
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
      // Delete old file if exists
      if (assignment.attachmentFileId) {
        await this.localStorageService.deleteFile(assignment.attachmentFileId);
      }
      const uploaded = await this.localStorageService.uploadFile(
        file,
        'assignments',
      );
      const attachmentFileId = uploaded.filePath;
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
    // Delete attachment file if exists
    if (assignment.attachmentFileId) {
      await this.localStorageService.deleteFile(assignment.attachmentFileId);
    }
    return this.assignmentsService.delete(assignmentId);
  }

  // ==================== ASSIGNMENT SUBMISSIONS ====================

  @Post(':courseId/lessons/:lessonId/assignments/:assignmentId/submissions')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  async submitAssignment(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CreateSubmissionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let submissionFiles: any[] | undefined;

    if (files && files.length > 0) {
      submissionFiles = [];
      for (const file of files) {
        const uploaded = await this.localStorageService.uploadFile(
          file,
          'submissions',
        );
        submissionFiles.push({
          fileId: uploaded.fileId,
          filePath: uploaded.filePath,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
        });
      }
    }

    // Count existing submissions for attempt number
    const existingCount = await this.assignmentSubmissionsService.count({
      where: { assignmentId, authorId: currentUser.userId },
    });

    return this.assignmentSubmissionsService.create({
      ...dto,
      assignmentId,
      authorId: currentUser.userId,
      submissionFiles,
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

  @Patch(
    ':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId/grade',
  )
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

  @Patch(
    ':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId',
  )
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  async updateSubmission(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('submissionId') submissionId: string,
    @Body() dto: UpdateSubmissionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const submission =
      await this.assignmentSubmissionsService.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.authorId !== currentUser.userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài nộp này');
    }
    if (submission.status === 'graded') {
      throw new ForbiddenException(
        'Không thể chỉnh sửa bài nộp đã được chấm điểm',
      );
    }

    const updateData: any = {};
    if (dto.content !== undefined) {
      updateData.content = dto.content;
    }

    if (files && files.length > 0) {
      // Delete old files if exist
      if (submission.submissionFiles && submission.submissionFiles.length > 0) {
        for (const oldFile of submission.submissionFiles) {
          await this.localStorageService.deleteFile(oldFile.filePath);
        }
      }
      // Upload new files
      const submissionFiles: any[] = [];
      for (const file of files) {
        const uploaded = await this.localStorageService.uploadFile(
          file,
          'submissions',
        );
        submissionFiles.push({
          fileId: uploaded.fileId,
          filePath: uploaded.filePath,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
        });
      }
      updateData.submissionFiles = submissionFiles;
    }

    updateData.submittedAt = new Date();
    return this.assignmentSubmissionsService.update(submissionId, updateData);
  }

  @Get(
    ':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId/download',
  )
  @ApiBearerAuth('JWT-auth')
  async downloadSubmission(
    @Param('submissionId') submissionId: string,
    @Query('fileIndex') fileIndex: string,
    @Res() res: Response,
  ) {
    const submission =
      await this.assignmentSubmissionsService.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (
      !submission.submissionFiles ||
      submission.submissionFiles.length === 0
    ) {
      throw new NotFoundException('Submission has no files');
    }

    const idx = parseInt(fileIndex || '0', 10);
    if (isNaN(idx) || idx < 0 || idx >= submission.submissionFiles.length) {
      throw new NotFoundException('File index out of range');
    }

    const fileInfo = submission.submissionFiles[idx];
    const absolutePath = this.localStorageService.getAbsolutePath(
      fileInfo.filePath,
    );
    const exists = this.localStorageService.fileExists(fileInfo.filePath);
    if (!exists) {
      throw new NotFoundException('File not found on server');
    }

    res.download(absolutePath, fileInfo.fileName || 'download');
  }

  @Delete(
    ':courseId/lessons/:lessonId/assignments/:assignmentId/submissions/:submissionId',
  )
  @ApiBearerAuth('JWT-auth')
  async deleteSubmission(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('submissionId') submissionId: string,
  ) {
    const submission =
      await this.assignmentSubmissionsService.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.authorId !== currentUser.userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài nộp này');
    }
    if (submission.status === 'graded') {
      throw new ForbiddenException('Không thể xóa bài nộp đã được chấm điểm');
    }
    // Delete files if exist
    if (submission.submissionFiles && submission.submissionFiles.length > 0) {
      for (const file of submission.submissionFiles) {
        await this.localStorageService.deleteFile(file.filePath);
      }
    }
    return this.assignmentSubmissionsService.delete(submissionId);
  }
}
