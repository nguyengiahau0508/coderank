import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ConversationEntity } from '../../modules/agent/entities/conversation.entity';
import { ConversationMessageEntity } from '../../modules/agent/entities/conversation-message.entity';
import { UserAiConfigEntity } from '../../modules/agent/entities/user-ai-config.entity';
import { CodeReviewsEntity } from '../../modules/ai-features/entities/code-reviews.entity';
import { AiHintsEntity } from '../../modules/ai-features/entities/ai-hints.entity';
import { AiGradingsEntity } from '../../modules/ai-features/entities/ai-gradings.entity';
import { AiGeneratedTestcasesEntity } from '../../modules/ai-features/entities/ai-generated-testcases.entity';
import { PlagiarismReportsEntity } from '../../modules/ai-features/entities/plagiarism-reports.entity';
import { UserSkillProfilesEntity } from '../../modules/ai-features/entities/user-skill-profiles.entity';
import { LearningPathsEntity } from '../../modules/ai-features/entities/learning-paths.entity';
import { ClassAnalyticsEntity } from '../../modules/ai-features/entities/class-analytics.entity';
import { UsersEntity } from '../../modules/users/entities/user.entity';
import { ProblemsEntity } from '../../modules/problems/entities/problems.entity';
import { SubmissionsEntity } from '../../modules/problems/entities/submissions.entity';
import { CoursesEntity } from '../../modules/courses/entities/courses.entity';
import {
  AiProviderEnum,
  AiHintLevelEnum,
  CodeReviewSeverityEnum,
  CodeReviewStatusEnum,
} from '../../common/enums/enums';

export async function seedAiFeatures(
  dataSource: DataSource,
  users: UsersEntity[],
  problems: ProblemsEntity[],
) {
  console.log('🌱 Seeding AI features...');

  const conversationRepo = dataSource.getRepository(ConversationEntity);
  const messageRepo = dataSource.getRepository(ConversationMessageEntity);
  const aiConfigRepo = dataSource.getRepository(UserAiConfigEntity);
  const codeReviewRepo = dataSource.getRepository(CodeReviewsEntity);
  const aiHintRepo = dataSource.getRepository(AiHintsEntity);
  const aiGradingRepo = dataSource.getRepository(AiGradingsEntity);
  const aiTestcaseRepo = dataSource.getRepository(AiGeneratedTestcasesEntity);
  const plagiarismRepo = dataSource.getRepository(PlagiarismReportsEntity);
  const skillProfileRepo = dataSource.getRepository(UserSkillProfilesEntity);
  const learningPathRepo = dataSource.getRepository(LearningPathsEntity);
  const classAnalyticsRepo = dataSource.getRepository(ClassAnalyticsEntity);

  const students = users.filter((u) => u.roles.includes('student' as any));
  const instructors = users.filter((u) =>
    u.roles.includes('instructor' as any),
  );

  // Create AI configs for users
  const aiConfigs: UserAiConfigEntity[] = [];
  for (const user of users) {
    const config = aiConfigRepo.create({
      authorId: user.id,
      provider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      apiKey: faker.string.alphanumeric(32),
      modelName: faker.helpers.arrayElement([
        'gemini-2.5-flash',
        'gpt-4',
        'claude-3-opus',
      ]),
      baseHost: faker.datatype.boolean(0.3)
        ? 'http://localhost:11434'
        : undefined,
    });
    aiConfigs.push(config);
  }
  await aiConfigRepo.save(aiConfigs);

  // Create conversations
  const conversations: ConversationEntity[] = [];
  for (const student of students.slice(0, 20)) {
    const numConversations = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < numConversations; i++) {
      const conversation = conversationRepo.create({
        authorId: student.id,
        title: faker.lorem.sentence(),
      });
      conversations.push(conversation);
    }
  }
  await conversationRepo.save(conversations);

  // Create messages for conversations
  const messages: ConversationMessageEntity[] = [];
  for (const conversation of conversations) {
    const numMessages = faker.number.int({ min: 2, max: 10 });
    for (let i = 0; i < numMessages; i++) {
      const message = messageRepo.create({
        conversationId: conversation.id,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: faker.lorem.paragraph(),
      });
      messages.push(message);
    }
  }
  await messageRepo.save(messages);

  // Get submissions for AI features
  const submissionRepo = dataSource.getRepository(SubmissionsEntity);
  const submissions = await submissionRepo.find({ take: 100 });

  // Create code reviews
  const codeReviews: CodeReviewsEntity[] = [];
  for (const submission of submissions.slice(0, 50)) {
    const review = codeReviewRepo.create({
      submissionId: submission.id,
      status: faker.helpers.arrayElement(Object.values(CodeReviewStatusEnum)),
      overallScore: faker.number.int({ min: 60, max: 100 }),
      readabilityScore: faker.number.int({ min: 50, max: 100 }),
      maintainabilityScore: faker.number.int({ min: 50, max: 100 }),
      efficiencyScore: faker.number.int({ min: 50, max: 100 }),
      bestPracticesScore: faker.number.int({ min: 50, max: 100 }),
      timeComplexity: faker.helpers.arrayElement([
        'O(n)',
        'O(n log n)',
        'O(n²)',
        'O(1)',
      ]),
      spaceComplexity: faker.helpers.arrayElement(['O(1)', 'O(n)', 'O(n²)']),
      issues: [
        {
          severity: 'warning',
          line: faker.number.int({ min: 1, max: 100 }),
          message: faker.lorem.sentence(),
          rule: 'code-style',
          suggestion: faker.lorem.sentence(),
        },
      ],
      suggestions: [faker.lorem.sentence(), faker.lorem.sentence()],
      summary: faker.lorem.paragraph(),
      reviewedBy: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      processingTimeMs: faker.number.int({ min: 100, max: 5000 }),
    });
    codeReviews.push(review);
  }
  await codeReviewRepo.save(codeReviews);

  // Create AI hints
  const aiHints: AiHintsEntity[] = [];
  for (const problem of problems.slice(0, 30)) {
    const numHints = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numHints; i++) {
      const hint = aiHintRepo.create({
        problemId: problem.id,
        level: faker.helpers.arrayElement(Object.values(AiHintLevelEnum)),
        contentVi: faker.lorem.paragraph(),
        contentEn: faker.lorem.paragraph(),
        order: i,
        isActive: true,
        generatedBy: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      });
      aiHints.push(hint);
    }
  }
  await aiHintRepo.save(aiHints);

  // Create AI gradings
  const aiGradings: AiGradingsEntity[] = [];
  for (const submission of submissions.slice(0, 40)) {
    const grading = aiGradingRepo.create({
      submissionId: submission.id,
      rubricScores: [
        {
          criterion: 'Correctness',
          maxScore: 40,
          score: faker.number.int({ min: 20, max: 40 }),
          feedback: faker.lorem.sentence(),
        },
        {
          criterion: 'Code Quality',
          maxScore: 30,
          score: faker.number.int({ min: 15, max: 30 }),
          feedback: faker.lorem.sentence(),
        },
        {
          criterion: 'Efficiency',
          maxScore: 30,
          score: faker.number.int({ min: 15, max: 30 }),
          feedback: faker.lorem.sentence(),
        },
      ],
      totalScore: faker.number.float({ min: 40, max: 100, fractionDigits: 2 }),
      maxPossibleScore: 100,
      percentageScore: faker.number.float({
        min: 40,
        max: 100,
        fractionDigits: 2,
      }),
      overallFeedback: faker.lorem.paragraph(),
      strengths: [faker.lorem.sentence(), faker.lorem.sentence()],
      improvements: [faker.lorem.sentence(), faker.lorem.sentence()],
      confidenceScore: faker.number.float({
        min: 0.7,
        max: 0.99,
        fractionDigits: 2,
      }),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      aiModel: 'gpt-4',
      isVerified: faker.datatype.boolean(0.5),
      verifiedBy: faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement(instructors).id
        : undefined,
    });
    aiGradings.push(grading);
  }
  await aiGradingRepo.save(aiGradings);

  // Create AI generated testcases
  const aiTestcases: AiGeneratedTestcasesEntity[] = [];
  for (const problem of problems.slice(0, 20)) {
    const numTestcases = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < numTestcases; i++) {
      const testcase = aiTestcaseRepo.create({
        problemId: problem.id,
        input: faker.lorem.words(5),
        expectedOutput: faker.lorem.word(),
        category: faker.helpers.arrayElement([
          'normal',
          'edge',
          'corner',
          'performance',
          'random',
        ]),
        description: faker.lorem.sentence(),
        isApproved: faker.datatype.boolean(0.7),
        isPublic: faker.datatype.boolean(0.6),
        coverageScore: faker.number.float({
          min: 0.5,
          max: 1,
          fractionDigits: 2,
        }),
        generatedBy: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      });
      aiTestcases.push(testcase);
    }
  }
  await aiTestcaseRepo.save(aiTestcases);

  // Create plagiarism reports
  const plagiarismReports: PlagiarismReportsEntity[] = [];
  for (let i = 0; i < 20; i++) {
    const submission1 = faker.helpers.arrayElement(submissions);
    const submission2 = faker.helpers.arrayElement(
      submissions.filter((s) => s.id !== submission1.id),
    );

    const report = plagiarismRepo.create({
      submissionId: submission1.id,
      maxSimilarity: faker.number.float({
        min: 0.3,
        max: 1,
        fractionDigits: 2,
      }),
      isFlagged: faker.datatype.boolean(0.4),
      matches: [
        {
          submissionId: submission2.id,
          similarity: faker.number.float({
            min: 0.3,
            max: 1,
            fractionDigits: 2,
          }),
          matchedLines: [
            {
              sourceLine: faker.number.int({ min: 1, max: 50 }),
              targetLine: faker.number.int({ min: 1, max: 50 }),
            },
          ],
        },
      ],
      matchCount: faker.number.int({ min: 1, max: 10 }),
      analysis: faker.lorem.paragraph(),
      isReviewed: faker.datatype.boolean(0.5),
      reviewedById: faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement(instructors).id
        : undefined,
      reviewNotes: faker.lorem.sentence(),
      processingTimeMs: faker.number.int({ min: 500, max: 5000 }),
    });
    plagiarismReports.push(report);
  }
  await plagiarismRepo.save(plagiarismReports);

  // Create user skill profiles
  const skillProfiles: UserSkillProfilesEntity[] = [];
  for (const student of students) {
    const profile = skillProfileRepo.create({
      userId: student.id,
      topicSkills: {
        'data-structures': {
          level: faker.number.int({ min: 0, max: 100 }),
          problemsSolved: faker.number.int({ min: 0, max: 20 }),
          averageAttempts: faker.number.float({
            min: 1,
            max: 3,
            fractionDigits: 1,
          }),
          lastPracticed: faker.date.recent().toISOString(),
        },
        algorithms: {
          level: faker.number.int({ min: 0, max: 100 }),
          problemsSolved: faker.number.int({ min: 0, max: 20 }),
          averageAttempts: faker.number.float({
            min: 1,
            max: 3,
            fractionDigits: 1,
          }),
          lastPracticed: faker.date.recent().toISOString(),
        },
      },
      strengths: ['Array manipulation', 'String processing'],
      weaknesses: ['Graph algorithms', 'Dynamic programming'],
      totalProblemsSolved: faker.number.int({ min: 0, max: 100 }),
      totalSubmissions: faker.number.int({ min: 0, max: 150 }),
      averageAccuracy: faker.number.float({
        min: 0.5,
        max: 1,
        fractionDigits: 2,
      }),
      averageAttemptsPerProblem: faker.number.float({
        min: 1,
        max: 5,
        fractionDigits: 2,
      }),
      easySolved: faker.number.int({ min: 0, max: 30 }),
      mediumSolved: faker.number.int({ min: 0, max: 20 }),
      hardSolved: faker.number.int({ min: 0, max: 10 }),
      learningPace: faker.helpers.arrayElement(['slow', 'moderate', 'fast']),
      preferredDifficulty: 'medium',
      averageCodeQuality: faker.number.float({
        min: 0.6,
        max: 1,
        fractionDigits: 2,
      }),
      averageTimeComplexityScore: faker.number.float({
        min: 0.6,
        max: 1,
        fractionDigits: 2,
      }),
      lastAnalyzedAt: faker.date.recent(),
    });
    skillProfiles.push(profile);
  }
  await skillProfileRepo.save(skillProfiles);

  // Create learning paths
  const learningPaths: LearningPathsEntity[] = [];
  for (const student of students.slice(0, 30)) {
    const goalTopics = ['Arrays', 'Strings', 'Hash Tables', 'Trees', 'Graphs'];
    const goalTopic = faker.helpers.arrayElement(goalTopics);

    const path = learningPathRepo.create({
      userId: student.id,
      title: `${goalTopic} Learning Path`,
      description: faker.lorem.paragraph(),
      goalTopic,
      targetLevel: faker.helpers.arrayElement([
        'beginner',
        'intermediate',
        'advanced',
        'expert',
      ]),
      steps: [
        {
          order: 1,
          title: `Introduction to ${goalTopic}`,
          description: 'Learn the basics',
          type: 'topic',
          resourceId: faker.helpers.arrayElement(problems).id,
          estimatedTime: 60,
          isCompleted: faker.datatype.boolean(0.5),
          completedAt: faker.datatype.boolean(0.3)
            ? new Date().toISOString()
            : undefined,
        },
        {
          order: 2,
          title: `Practice ${goalTopic}`,
          description: 'Solve problems',
          type: 'problem',
          resourceId: faker.helpers.arrayElement(problems).id,
          estimatedTime: 120,
          isCompleted: faker.datatype.boolean(0.3),
          completedAt: faker.datatype.boolean(0.1)
            ? new Date().toISOString()
            : undefined,
        },
      ],
      currentStepIndex: faker.number.int({ min: 0, max: 1 }),
      completedSteps: faker.number.int({ min: 0, max: 2 }),
      totalSteps: 2,
      progressPercent: faker.number.float({
        min: 0,
        max: 100,
        fractionDigits: 1,
      }),
      status: faker.helpers.arrayElement([
        'draft',
        'active',
        'paused',
        'completed',
        'abandoned',
      ]),
      estimatedTotalMinutes: 180,
      actualMinutesSpent: faker.number.int({ min: 0, max: 200 }),
      generatedBy: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      startedAt: faker.date.recent(),
      completedAt: faker.datatype.boolean(0.2)
        ? faker.date.future()
        : undefined,
    });
    learningPaths.push(path);
  }
  await learningPathRepo.save(learningPaths);

  // Create class analytics
  const courseRepo = dataSource.getRepository(CoursesEntity);
  const courses = await courseRepo.find({ take: 10 });

  const classAnalytics: ClassAnalyticsEntity[] = [];
  for (const course of courses) {
    const analytics = classAnalyticsRepo.create({
      courseId: course.id,
      instructorId: faker.helpers.arrayElement(instructors).id,
      periodStart: faker.date.recent({ days: 30 }),
      periodEnd: faker.date.soon({ days: 30 }),
      totalStudents: faker.number.int({ min: 20, max: 100 }),
      activeStudents: faker.number.int({ min: 10, max: 80 }),
      averageProgress: faker.number.float({
        min: 20,
        max: 100,
        fractionDigits: 1,
      }),
      totalSubmissions: faker.number.int({ min: 50, max: 500 }),
      acceptedSubmissions: faker.number.int({ min: 30, max: 400 }),
      overallAcceptanceRate: faker.number.float({
        min: 0.5,
        max: 1,
        fractionDigits: 2,
      }),
      averageAttemptsPerProblem: faker.number.float({
        min: 1,
        max: 5,
        fractionDigits: 2,
      }),
      totalProblemsAssigned: faker.number.int({ min: 10, max: 50 }),
      problemsWithZeroSolves: faker.number.int({ min: 0, max: 10 }),
      difficultyBreakdown: {
        easy: {
          assigned: 20,
          avgAcceptance: faker.number.float({
            min: 0.7,
            max: 1,
            fractionDigits: 2,
          }),
        },
        medium: {
          assigned: 20,
          avgAcceptance: faker.number.float({
            min: 0.5,
            max: 0.9,
            fractionDigits: 2,
          }),
        },
        hard: {
          assigned: 10,
          avgAcceptance: faker.number.float({
            min: 0.2,
            max: 0.6,
            fractionDigits: 2,
          }),
        },
      },
      topicPerformance: {
        arrays: {
          totalProblems: 5,
          averageAcceptance: faker.number.float({
            min: 0.6,
            max: 1,
            fractionDigits: 2,
          }),
          averageAttempts: faker.number.float({
            min: 1,
            max: 3,
            fractionDigits: 2,
          }),
        },
        strings: {
          totalProblems: 4,
          averageAcceptance: faker.number.float({
            min: 0.5,
            max: 0.95,
            fractionDigits: 2,
          }),
          averageAttempts: faker.number.float({
            min: 1,
            max: 4,
            fractionDigits: 2,
          }),
        },
      },
      commonMistakes: [
        {
          category: 'off-by-one',
          description: 'Students making off-by-one errors in loop conditions',
          frequency: faker.number.int({ min: 5, max: 20 }),
          affectedStudents: faker.number.int({ min: 3, max: 15 }),
        },
      ],
      aiInsights: {
        summary: faker.lorem.paragraph(),
        summaryVi: faker.lorem.paragraph(),
        recommendations: [faker.lorem.sentence(), faker.lorem.sentence()],
        recommendationsVi: [faker.lorem.sentence(), faker.lorem.sentence()],
        alerts: [faker.lorem.sentence()],
        alertsVi: [faker.lorem.sentence()],
      },
      strugglingTopics: ['dynamic-programming', 'graph-algorithms'],
      generatedAt: faker.date.recent(),
    });
    classAnalytics.push(analytics);
  }
  await classAnalyticsRepo.save(classAnalytics);

  console.log(
    `✅ Created ${conversations.length} conversations, ${messages.length} messages, ${aiConfigs.length} AI configs, ${codeReviews.length} code reviews, ${aiHints.length} AI hints, ${aiGradings.length} AI gradings, ${plagiarismReports.length} plagiarism reports, ${skillProfiles.length} skill profiles, ${learningPaths.length} learning paths, ${classAnalytics.length} class analytics`,
  );
}
