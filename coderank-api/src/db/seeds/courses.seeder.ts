import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { CoursesEntity } from '../../modules/courses/entities/courses.entity';
import { CourseSectionsEntity } from '../../modules/courses/entities/course-sections.entity';
import { CourseLessonsEntity } from '../../modules/courses/entities/course-lessons.entity';
import { CourseEnrollmentsEntity } from '../../modules/courses/entities/course-enrollments.entity';
import { CourseQuizzesEntity } from '../../modules/courses/entities/course-quizzes.entity';
import { CourseQuizQuestionsEntity } from '../../modules/courses/entities/course-quiz-questions.entity';
import { CourseQuizAttemptsEntity } from '../../modules/courses/entities/course-quiz-attempts.entity';
import { CourseAssignmentsEntity } from '../../modules/courses/entities/course-assignments.entity';
import { CourseAssignmentSubmissionsEntity } from '../../modules/courses/entities/course-assignment-submissions.entity';
import { CourseReviewsEntity } from '../../modules/courses/entities/course-reviews.entity';
import { CourseLessonProgressEntity } from '../../modules/courses/entities/course-lesson-progress.entity';
import { CourseLessonProblemsEntity } from '../../modules/courses/entities/course-lesson-problems.entity';
import { UsersEntity } from '../../modules/users/entities/user.entity';
import { ProblemsEntity } from '../../modules/problems/entities/problems.entity';
import {
  CourseLevelEnum,
  CourseStatusEnum,
  LessonTypeEnum,
  EnrollmentStatusEnum,
  QuizQuestionTypeEnum,
} from '../../common/enums/enums';
import { SubmissionStatusEnum } from '../../modules/courses/entities/course-assignment-submissions.entity';

export async function seedCourses(
  dataSource: DataSource,
  users: UsersEntity[],
  problems: ProblemsEntity[],
) {
  console.log('🌱 Seeding courses...');

  const courseRepo = dataSource.getRepository(CoursesEntity);
  const sectionRepo = dataSource.getRepository(CourseSectionsEntity);
  const lessonRepo = dataSource.getRepository(CourseLessonsEntity);
  const enrollmentRepo = dataSource.getRepository(CourseEnrollmentsEntity);
  const quizRepo = dataSource.getRepository(CourseQuizzesEntity);
  const quizQuestionRepo = dataSource.getRepository(CourseQuizQuestionsEntity);
  const quizAttemptRepo = dataSource.getRepository(CourseQuizAttemptsEntity);
  const assignmentRepo = dataSource.getRepository(CourseAssignmentsEntity);
  const assignmentSubmissionRepo = dataSource.getRepository(CourseAssignmentSubmissionsEntity);
  const reviewRepo = dataSource.getRepository(CourseReviewsEntity);
  const lessonProgressRepo = dataSource.getRepository(CourseLessonProgressEntity);
  const lessonProblemRepo = dataSource.getRepository(CourseLessonProblemsEntity);

  const instructors = users.filter((u) => u.roles.includes('instructor' as any));
  const students = users.filter((u) => u.roles.includes('student' as any));

  const courseTitles = [
    'Cấu trúc dữ liệu và Giải thuật',
    'Lập trình Web với React',
    'Python cho Data Science',
    'Java Spring Boot Fundamentals',
    'Machine Learning cơ bản',
    'Database Design và SQL',
    'DevOps và CI/CD',
    'Mobile Development với React Native',
    'Blockchain và Smart Contracts',
    'Cloud Computing với AWS',
  ];

  const courses: CoursesEntity[] = [];

  for (const title of courseTitles) {
    const instructor = faker.helpers.arrayElement(instructors);
    const level = faker.helpers.arrayElement(Object.values(CourseLevelEnum));

    const course = courseRepo.create({
      title,
      slug: slugify(title, { lower: true }),
      summary: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(3),
      thumbnailUrl: faker.image.url(),
      level,
      status: faker.helpers.arrayElement(Object.values(CourseStatusEnum)),
      isPublic: faker.datatype.boolean(0.8),
      maxStudents: faker.helpers.arrayElement([0, 30, 50, 100]),
      estimatedDurationMinutes: faker.number.int({ min: 300, max: 3000 }),
      tags: faker.helpers.arrayElements(['programming', 'web', 'backend', 'frontend', 'database'], 3).join(','),
      category: faker.helpers.arrayElement(['Programming', 'Web Development', 'Data Science', 'DevOps']),
      learningObjectives: JSON.stringify([
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ]),
      prerequisites: JSON.stringify([faker.lorem.sentence(), faker.lorem.sentence()]),
      enrollmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
      authorId: instructor.id,
    });
    courses.push(course);
  }
  await courseRepo.save(courses);

  // Create sections for each course
  const sections: CourseSectionsEntity[] = [];
  const lessons: CourseLessonsEntity[] = [];

  for (const course of courses) {
    const numSections = faker.number.int({ min: 3, max: 6 });

    for (let i = 0; i < numSections; i++) {
      const section = sectionRepo.create({
        courseId: course.id,
        title: `Section ${i + 1}: ${faker.lorem.words(3)}`,
        description: faker.lorem.paragraph(),
        sectionOrder: i,
        isPublished: faker.datatype.boolean(0.8),
      });
      sections.push(section);
    }
  }
  await sectionRepo.save(sections);

  // Create lessons for each section
  for (const section of sections) {
    const numLessons = faker.number.int({ min: 3, max: 8 });

    for (let i = 0; i < numLessons; i++) {
      const lessonType = faker.helpers.arrayElement(Object.values(LessonTypeEnum));

      const lesson = lessonRepo.create({
        sectionId: section.id,
        title: `Lesson ${i + 1}: ${faker.lorem.words(4)}`,
        content: lessonType === LessonTypeEnum.Text ? faker.lorem.paragraphs(5) : undefined,
        type: lessonType,
        videoUrl: lessonType === LessonTypeEnum.Video ? faker.internet.url() : undefined,
        videoDurationSeconds: lessonType === LessonTypeEnum.Video ? faker.number.int({ min: 300, max: 3600 }) : undefined,
        lessonOrder: i,
        estimatedMinutes: faker.number.int({ min: 10, max: 60 }),
        isPublished: faker.datatype.boolean(0.8),
        isFreePreview: i === 0,
      });
      lessons.push(lesson);
    }
  }
  await lessonRepo.save(lessons);

  // Create quizzes for quiz lessons (after lessons are saved)
  const quizzes: CourseQuizzesEntity[] = [];
  const quizLessons = lessons.filter((l) => l.type === LessonTypeEnum.Quiz);
  for (const lesson of quizLessons) {
    const quiz = quizRepo.create({
      lessonId: lesson.id,
      title: lesson.title,
      description: faker.lorem.sentence(),
      timeLimitMinutes: faker.number.int({ min: 10, max: 60 }),
      passingScore: faker.number.int({ min: 60, max: 80 }),
      maxAttempts: faker.helpers.arrayElement([1, 2, 3, 0]),
      quizOrder: 0,
      shuffleQuestions: faker.datatype.boolean(),
      showCorrectAnswers: faker.datatype.boolean(0.8),
      isPublished: faker.datatype.boolean(0.8),
    });
    quizzes.push(quiz);
  }
  await quizRepo.save(quizzes);

  // Create quiz questions
  const quizQuestions: CourseQuizQuestionsEntity[] = [];
  for (const quiz of quizzes) {
    const numQuestions = faker.number.int({ min: 5, max: 15 });

    for (let i = 0; i < numQuestions; i++) {
      const questionType = faker.helpers.arrayElement(Object.values(QuizQuestionTypeEnum));

      const question = quizQuestionRepo.create({
        quizId: quiz.id,
        questionText: faker.lorem.sentence() + '?',
        questionType,
        options: questionType === QuizQuestionTypeEnum.MultipleChoice
          ? [
              { id: 'A', text: faker.lorem.word(), isCorrect: true },
              { id: 'B', text: faker.lorem.word(), isCorrect: false },
              { id: 'C', text: faker.lorem.word(), isCorrect: false },
              { id: 'D', text: faker.lorem.word(), isCorrect: false },
            ]
          : undefined,
        correctAnswer: faker.lorem.word(),
        explanation: faker.lorem.sentence(),
        points: faker.number.int({ min: 1, max: 5 }),
        questionOrder: i,
      });
      quizQuestions.push(question);
    }
  }
  await quizQuestionRepo.save(quizQuestions);

  // Create assignments for practice lessons (after lessons are saved)
  const assignments: CourseAssignmentsEntity[] = [];
  const practiceLessons = lessons.filter((l) => l.type === LessonTypeEnum.Practice);
  for (const lesson of practiceLessons) {
    const assignment = assignmentRepo.create({
      lessonId: lesson.id,
      title: lesson.title,
      description: faker.lorem.paragraph(),
      maxScore: 100,
      dueDate: faker.date.future(),
      assignmentOrder: 0,
      isPublished: faker.datatype.boolean(0.8),
    });
    assignments.push(assignment);
  }
  await assignmentRepo.save(assignments);

  // Link problems to practice lessons
  const lessonProblems: CourseLessonProblemsEntity[] = [];
  for (const lesson of practiceLessons) {
    const numProblems = faker.number.int({ min: 1, max: 3 });
    const selectedProblems = faker.helpers.arrayElements(problems, numProblems);

    for (let i = 0; i < selectedProblems.length; i++) {
      const lessonProblem = lessonProblemRepo.create({
        lessonId: lesson.id,
        problemId: selectedProblems[i].id,
        problemOrder: i,
        isRequired: faker.datatype.boolean(0.7),
      });
      lessonProblems.push(lessonProblem);
    }
  }
  await lessonProblemRepo.save(lessonProblems);

  // Create enrollments
  const enrollments: CourseEnrollmentsEntity[] = [];
  for (const course of courses) {
    const numEnrollments = faker.number.int({ min: 10, max: 30 });
    const enrolledStudents = faker.helpers.arrayElements(students, numEnrollments);

    for (const student of enrolledStudents) {
      const enrollment = enrollmentRepo.create({
        courseId: course.id,
        userId: student.id,
        status: faker.helpers.arrayElement(Object.values(EnrollmentStatusEnum)),
        progressPercent: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        enrolledAt: faker.date.past(),
        completedAt: faker.datatype.boolean(0.2) ? faker.date.recent() : undefined,
      });
      enrollments.push(enrollment);
    }

    course.enrollmentCount = numEnrollments;
  }
  await enrollmentRepo.save(enrollments);

  // Create lesson progress
  const lessonProgress: CourseLessonProgressEntity[] = [];
  for (const enrollment of enrollments) {
    const courseLessons = lessons.filter((l) => {
      const section = sections.find((s) => s.id === l.sectionId);
      return section?.courseId === enrollment.courseId;
    });

    const numCompleted = faker.number.int({ min: 0, max: courseLessons.length });
    const completedLessons = faker.helpers.arrayElements(courseLessons, numCompleted);

    for (const lesson of completedLessons) {
      const progress = lessonProgressRepo.create({
        lessonId: lesson.id,
        userId: enrollment.userId,
        isCompleted: true,
        completedAt: faker.date.recent(),
        timeSpentSeconds: faker.number.int({ min: 300, max: 3600 }),
      });
      lessonProgress.push(progress);
    }
  }
  await lessonProgressRepo.save(lessonProgress);

  // Create quiz attempts
  const quizAttempts: CourseQuizAttemptsEntity[] = [];
  for (const enrollment of enrollments) {
    const courseLessons = lessons.filter((l) => {
      const section = sections.find((s) => s.id === l.sectionId);
      return section?.courseId === enrollment.courseId && l.type === LessonTypeEnum.Quiz;
    });

    for (const lesson of courseLessons) {
      const quiz = quizzes.find((q) => q.lessonId === lesson.id);
      if (!quiz) continue;

      const numAttempts = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < numAttempts; i++) {
        const score = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        const attempt = quizAttemptRepo.create({
          quizId: quiz.id,
          userId: enrollment.userId,
          score,
          pointsEarned: faker.number.int({ min: 0, max: 100 }),
          totalPoints: 100,
          answers: [],
          isPassed: score >= (quiz.passingScore || 60),
          startedAt: faker.date.recent(),
          completedAt: faker.date.recent(),
          timeTakenSeconds: faker.number.int({ min: 300, max: 3600 }),
          attemptNumber: i + 1,
        });
        quizAttempts.push(attempt);
      }
    }
  }
  await quizAttemptRepo.save(quizAttempts);

  // Create assignment submissions
  const assignmentSubmissions: CourseAssignmentSubmissionsEntity[] = [];
  for (const enrollment of enrollments) {
    const courseLessons = lessons.filter((l) => {
      const section = sections.find((s) => s.id === l.sectionId);
      return section?.courseId === enrollment.courseId && l.type === LessonTypeEnum.Practice;
    });

    for (const lesson of courseLessons) {
      const assignment = assignments.find((a) => a.lessonId === lesson.id);
      if (!assignment || !faker.datatype.boolean(0.7)) continue;

      const submission = assignmentSubmissionRepo.create({
        assignmentId: assignment.id,
        authorId: enrollment.userId,
        content: faker.lorem.paragraphs(2),
        status: faker.helpers.arrayElement(Object.values(SubmissionStatusEnum)),
        score: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        feedback: faker.lorem.paragraph(),
        gradedAt: faker.datatype.boolean(0.8) ? faker.date.recent() : undefined,
        attemptNumber: 1,
      });
      assignmentSubmissions.push(submission);
    }
  }
  await assignmentSubmissionRepo.save(assignmentSubmissions);

  // Create course reviews
  const reviews: CourseReviewsEntity[] = [];
  for (const course of courses) {
    const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
    const numReviews = faker.number.int({ min: 5, max: Math.min(15, courseEnrollments.length) });
    const reviewers = faker.helpers.arrayElements(courseEnrollments, numReviews);

    let totalRating = 0;
    for (const enrollment of reviewers) {
      const rating = faker.number.int({ min: 3, max: 5 });
      totalRating += rating;

      const review = reviewRepo.create({
        courseId: course.id,
        userId: enrollment.userId,
        rating,
        comment: faker.lorem.paragraph(),
        isVisible: faker.datatype.boolean(0.9),
      });
      reviews.push(review);
    }

    course.averageRating = totalRating / numReviews;
    course.reviewCount = numReviews;
  }
  await reviewRepo.save(reviews);
  await courseRepo.save(courses);

  console.log(
    `✅ Created ${courses.length} courses, ${sections.length} sections, ${lessons.length} lessons, ${enrollments.length} enrollments, ${quizzes.length} quizzes, ${assignments.length} assignments, ${reviews.length} reviews`,
  );
  return courses;
}
