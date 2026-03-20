import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CourseAssignmentsEntity,
  CourseEnrollmentsEntity,
  CourseLessonProblemsEntity,
  CourseLessonProgressEntity,
  CourseLessonsEntity,
  CourseQuizAttemptsEntity,
  CourseQuizQuestionsEntity,
  CourseQuizzesEntity,
  CourseReviewsEntity,
  CourseSectionsEntity,
  CoursesEntity,
} from './entities';
import {
  CourseAssignmentsService,
  CourseAssignmentSubmissionsService,
  CourseEnrollmentsService,
  CourseLessonProblemsService,
  CourseLessonProgressService,
  CourseLessonsService,
  CourseQuizAttemptsService,
  CourseQuizQuestionsService,
  CourseQuizzesService,
  CourseReviewsService,
  CourseSectionsService,
  CoursesService,
} from './services';
import { CoursesController } from './courses.controller';
import { CourseAssignmentSubmissionsEntity } from './entities/course-assignment-submissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseAssignmentSubmissionsEntity,
      CourseAssignmentsEntity,
      CourseEnrollmentsEntity,
      CourseLessonProblemsEntity,
      CourseLessonProgressEntity,
      CourseLessonsEntity,
      CourseQuizAttemptsEntity,
      CourseQuizQuestionsEntity,
      CourseQuizzesEntity,
      CourseReviewsEntity,
      CourseSectionsEntity,
      CoursesEntity,
    ]),
  ],
  controllers: [CoursesController],
  providers: [
    CourseAssignmentsService,
    CourseAssignmentSubmissionsService,
    CourseEnrollmentsService,
    CourseLessonProblemsService,
    CourseLessonProgressService,
    CourseLessonsService,
    CourseQuizAttemptsService,
    CourseQuizQuestionsService,
    CourseQuizzesService,
    CourseReviewsService,
    CourseSectionsService,
    CoursesService,
  ],
})
export class CoursesModule {}
