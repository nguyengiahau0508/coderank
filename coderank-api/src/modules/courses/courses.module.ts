import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseEnrollmentsEntity, CourseLessonProblemsEntity, CourseLessonProgressEntity, CourseLessonsEntity, CourseQuizAttemptsEntity, CourseQuizQuestionsEntity, CourseQuizzesEntity, CourseReviewsEntity, CourseSectionsEntity, CoursesEntity } from "./entities";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            CourseEnrollmentsEntity,
            CourseLessonProblemsEntity,
            CourseLessonProgressEntity,
            CourseLessonsEntity,
            CourseQuizAttemptsEntity,
            CourseQuizQuestionsEntity,
            CourseQuizzesEntity,
            CourseReviewsEntity,
            CourseSectionsEntity,
            CoursesEntity
        ])
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class CoursesModule { }