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
  const instructors = users.filter((u) => u.roles.includes('instructor' as any));

  // Create AI configs for users
  const aiConfigs: UserAiConfigEntity[] = [];
  for (const user of users) {
    const config = aiConfigRepo.create({
      userId: user.id,
      provider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      apiKey: faker.string.alphanumeric(32),
      model: faker.helpers.arrayElement(['gemini-pro', 'gpt-4', 'claude-3-opus']),
      temperature: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      maxTokens: faker.helpers.arrayElement([1000, 2000, 4000]),
      isActive: true,
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
        userId: student.id,
        title: faker.lorem.sentence(),
        context: JSON.stringify({ problemId: faker.helpers.arrayElement(problems).id }),
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
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
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
      userId: submission.userId,
      status: faker.helpers.arrayElement(Object.values(CodeReviewStatusEnum)),
      findings: JSON.stringify([
        {
          line: faker.number.int({ min: 1, max: 100 }),
          severity: faker.helpers.arrayElement(Object.values(CodeReviewSeverityEnum)),
          message: faker.lorem.sentence(),
          suggestion: faker.lorem.sentence(),
        },
      ]),
      overallScore: faker.number.int({ min: 60, max: 100 }),
      suggestions: faker.lorem.paragraph(),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      processingTime: faker.number.int({ min: 100, max: 5000 }),
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
        userId: faker.helpers.arrayElement(students).id,
        level: faker.helpers.arrayElement(Object.values(AiHintLevelEnum)),
        content: faker.lorem.paragraph(),
        aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
        generationTime: faker.number.int({ min: 500, max: 3000 }),
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
      userId: submission.userId,
      score: faker.number.int({ min: 0, max: 100 }),
      feedback: faker.lorem.paragraph(),
      strengths: JSON.stringify([faker.lorem.sentence(), faker.lorem.sentence()]),
      weaknesses: JSON.stringify([faker.lorem.sentence(), faker.lorem.sentence()]),
      suggestions: JSON.stringify([faker.lorem.sentence(), faker.lorem.sentence()]),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      processingTime: faker.number.int({ min: 1000, max: 5000 }),
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
        explanation: faker.lorem.sentence(),
        difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
        aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
        isApproved: faker.datatype.boolean(0.7),
        approvedBy: faker.datatype.boolean(0.5) ? faker.helpers.arrayElement(instructors).id : null,
      });
      aiTestcases.push(testcase);
    }
  }
  await aiTestcaseRepo.save(aiTestcases);

  // Create plagiarism reports
  const plagiarismReports: PlagiarismReportsEntity[] = [];
  for (let i = 0; i < 20; i++) {
    const submission1 = faker.helpers.arrayElement(submissions);
    const submission2 = faker.helpers.arrayElement(submissions.filter((s) => s.id !== submission1.id));

    const report = plagiarismRepo.create({
      submission1Id: submission1.id,
      submission2Id: submission2.id,
      similarityScore: faker.number.float({ min: 0.3, max: 1, fractionDigits: 2 }),
      matchedSegments: JSON.stringify([
        { line1: faker.number.int({ min: 1, max: 50 }), line2: faker.number.int({ min: 1, max: 50 }), length: faker.number.int({ min: 5, max: 20 }) },
      ]),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
      isReviewed: faker.datatype.boolean(0.5),
      reviewedBy: faker.datatype.boolean(0.3) ? faker.helpers.arrayElement(instructors).id : null,
      verdict: faker.helpers.arrayElement(['clean', 'suspicious', 'plagiarized', null]),
    });
    plagiarismReports.push(report);
  }
  await plagiarismRepo.save(plagiarismReports);

  // Create user skill profiles
  const skillProfiles: UserSkillProfilesEntity[] = [];
  for (const student of students) {
    const profile = skillProfileRepo.create({
      userId: student.id,
      skills: JSON.stringify({
        'data-structures': faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        'algorithms': faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        'dynamic-programming': faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        'graph-theory': faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      }),
      strengths: JSON.stringify(['Array manipulation', 'String processing']),
      weaknesses: JSON.stringify(['Graph algorithms', 'Dynamic programming']),
      recommendedTopics: JSON.stringify(['Binary Search', 'Two Pointers']),
      lastAnalyzed: faker.date.recent(),
    });
    skillProfiles.push(profile);
  }
  await skillProfileRepo.save(skillProfiles);

  // Create learning paths
  const learningPaths: LearningPathsEntity[] = [];
  for (const student of students.slice(0, 30)) {
    const path = learningPathRepo.create({
      userId: student.id,
      title: `Learning Path for ${student.username}`,
      description: faker.lorem.paragraph(),
      steps: JSON.stringify([
        { order: 1, topic: 'Arrays', problems: faker.helpers.arrayElements(problems, 3).map((p) => p.id) },
        { order: 2, topic: 'Strings', problems: faker.helpers.arrayElements(problems, 3).map((p) => p.id) },
        { order: 3, topic: 'Hash Tables', problems: faker.helpers.arrayElements(problems, 3).map((p) => p.id) },
      ]),
      currentStep: faker.number.int({ min: 0, max: 2 }),
      progress: faker.number.int({ min: 0, max: 100 }),
      estimatedCompletionDate: faker.date.future(),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
    });
    learningPaths.push(path);
  }
  await learningPathRepo.save(learningPaths);

  // Create class analytics
  const classAnalytics: ClassAnalyticsEntity[] = [];
  for (const instructor of instructors) {
    const analytics = classAnalyticsRepo.create({
      instructorId: instructor.id,
      courseId: null,
      period: 'monthly',
      metrics: JSON.stringify({
        averageScore: faker.number.float({ min: 60, max: 95, fractionDigits: 2 }),
        completionRate: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
        activeStudents: faker.number.int({ min: 20, max: 100 }),
        strugglingStudents: faker.number.int({ min: 0, max: 20 }),
      }),
      insights: JSON.stringify([
        'Students struggle with dynamic programming',
        'High engagement in graph theory lessons',
      ]),
      recommendations: JSON.stringify([
        'Add more practice problems for DP',
        'Create additional video tutorials',
      ]),
      generatedAt: faker.date.recent(),
      aiProvider: faker.helpers.arrayElement(Object.values(AiProviderEnum)),
    });
    classAnalytics.push(analytics);
  }
  await classAnalyticsRepo.save(classAnalytics);

  console.log(
    `✅ Created ${conversations.length} conversations, ${messages.length} messages, ${aiConfigs.length} AI configs, ${codeReviews.length} code reviews, ${aiHints.length} AI hints, ${aiGradings.length} AI gradings, ${plagiarismReports.length} plagiarism reports, ${skillProfiles.length} skill profiles, ${learningPaths.length} learning paths, ${classAnalytics.length} class analytics`,
  );
}
