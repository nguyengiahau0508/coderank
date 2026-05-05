import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { ProblemsEntity } from '../../modules/problems/entities/problems.entity';
import { TagsEntity } from '../../modules/problems/entities/tags.entity';
import { TestcasesEntity } from '../../modules/problems/entities/testcases.entity';
import { HintsEntity } from '../../modules/problems/entities/hints.entity';
import { SolutionsEntity } from '../../modules/problems/entities/solutions.entity';
import { SubmissionsEntity } from '../../modules/problems/entities/submissions.entity';
import { UsersEntity } from '../../modules/users/entities/user.entity';
import {
  DifficultyEnum,
  TestcaseCompareTypeEnum,
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from '../../common/enums/enums';

export async function seedProblems(
  dataSource: DataSource,
  users: UsersEntity[],
) {
  console.log('🌱 Seeding problems...');

  const problemRepo = dataSource.getRepository(ProblemsEntity);
  const tagRepo = dataSource.getRepository(TagsEntity);
  const testcaseRepo = dataSource.getRepository(TestcasesEntity);
  const hintRepo = dataSource.getRepository(HintsEntity);
  const solutionRepo = dataSource.getRepository(SolutionsEntity);
  const submissionRepo = dataSource.getRepository(SubmissionsEntity);

  // Create tags
  const tagNames = [
    'Array',
    'String',
    'Hash Table',
    'Dynamic Programming',
    'Math',
    'Sorting',
    'Greedy',
    'Depth-First Search',
    'Binary Search',
    'Breadth-First Search',
    'Tree',
    'Graph',
    'Backtracking',
    'Stack',
    'Queue',
    'Linked List',
    'Recursion',
    'Two Pointers',
    'Sliding Window',
    'Bit Manipulation',
  ];

  const tags: TagsEntity[] = [];
  for (const name of tagNames) {
    const tag = tagRepo.create({
      name,
      slug: slugify(name, { lower: true }),
      description: `Problems related to ${name}`,
    });
    tags.push(tag);
  }
  await tagRepo.save(tags);

  // Create problems
  const problems: ProblemsEntity[] = [];
  const problemTitles = [
    'Two Sum',
    'Reverse String',
    'Palindrome Number',
    'Longest Substring Without Repeating Characters',
    'Median of Two Sorted Arrays',
    'Container With Most Water',
    'Valid Parentheses',
    'Merge Two Sorted Lists',
    'Remove Duplicates from Sorted Array',
    'Search Insert Position',
    'Maximum Subarray',
    'Climbing Stairs',
    'Binary Tree Inorder Traversal',
    'Symmetric Tree',
    'Maximum Depth of Binary Tree',
    'Best Time to Buy and Sell Stock',
    'Valid Palindrome',
    'Single Number',
    'Linked List Cycle',
    'Min Stack',
    'Intersection of Two Arrays',
    'Happy Number',
    'Count Primes',
    'Reverse Linked List',
    'Contains Duplicate',
    'Move Zeroes',
    'Power of Three',
    'Reverse Vowels of a String',
    'Intersection of Two Arrays II',
    'First Unique Character in a String',
  ];

  const instructors = users.filter((u) =>
    u.roles.includes('instructor' as any),
  );

  for (let i = 0; i < problemTitles.length; i++) {
    const title = problemTitles[i];
    const difficulty = faker.helpers.arrayElement(
      Object.values(DifficultyEnum),
    );
    const author = faker.helpers.arrayElement(instructors);

    const problem = problemRepo.create({
      title,
      slug: slugify(title, { lower: true }),
      description: `# ${title}\n\n${faker.lorem.paragraphs(3)}\n\n## Example\n\n\`\`\`\nInput: ${faker.lorem.sentence()}\nOutput: ${faker.lorem.word()}\n\`\`\``,
      inputDescription: faker.lorem.paragraph(),
      outputDescription: faker.lorem.paragraph(),
      notes: faker.lorem.paragraph(),
      timeLimitMs: faker.helpers.arrayElement([1000, 2000, 3000]),
      memoryLimitMb: faker.helpers.arrayElement([128, 256, 512]),
      difficulty,
      isPublished: faker.datatype.boolean(0.8),
      points:
        difficulty === DifficultyEnum.Easy
          ? 100
          : difficulty === DifficultyEnum.Medium
            ? 200
            : 300,
      authorId: author.id,
      tags: faker.helpers.arrayElements(
        tags,
        faker.number.int({ min: 2, max: 5 }),
      ),
    });
    problems.push(problem);
  }
  await problemRepo.save(problems);

  // Create testcases for each problem
  const testcases: TestcasesEntity[] = [];
  for (const problem of problems) {
    for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
      const testcase = testcaseRepo.create({
        problemId: problem.id,
        input: faker.lorem.words(5),
        expectedOutput: faker.lorem.word(),
        isSample: i < 2,
        testcaseOrder: i,
        compareType: TestcaseCompareTypeEnum.Exact,
      });
      testcases.push(testcase);
    }
  }
  await testcaseRepo.save(testcases);

  // Create hints for each problem
  const hints: HintsEntity[] = [];
  for (const problem of problems) {
    for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
      const hint = hintRepo.create({
        problemId: problem.id,
        content: faker.lorem.sentence(),
        hintOrder: i,
        isPublic: faker.datatype.boolean(0.7),
      });
      hints.push(hint);
    }
  }
  await hintRepo.save(hints);

  // Create solutions for each problem
  const solutions: SolutionsEntity[] = [];
  for (const problem of problems) {
    const languages = faker.helpers.arrayElements(
      Object.values(ProgrammingLanguageEnum),
      faker.number.int({ min: 1, max: 3 }),
    );

    for (const language of languages) {
      const solution = solutionRepo.create({
        problemId: problem.id,
        authorId: problem.authorId,
        language,
        title: `Solution for ${problem.title} in ${language}`,
        description: faker.lorem.paragraph(),
        code: `// Solution for ${problem.title} in ${language}\n${faker.lorem.paragraphs(2)}`,
        upvotes: faker.number.int({ min: 0, max: 100 }),
        downvotes: faker.number.int({ min: 0, max: 20 }),
      });
      solutions.push(solution);
    }
  }
  await solutionRepo.save(solutions);

  // Create submissions
  const submissions: SubmissionsEntity[] = [];
  const students = users.filter((u) => u.roles.includes('student' as any));

  for (const problem of problems) {
    const numSubmissions = faker.number.int({ min: 5, max: 20 });
    for (let i = 0; i < numSubmissions; i++) {
      const student = faker.helpers.arrayElement(students);
      const status = faker.helpers.arrayElement(
        Object.values(SubmissionStatusEnum),
      );
      const totalTests = faker.number.int({ min: 5, max: 10 });
      const passedTests =
        status === SubmissionStatusEnum.Accepted
          ? totalTests
          : faker.number.int({ min: 0, max: totalTests });

      const submission = submissionRepo.create({
        problemId: problem.id,
        authorId: student.id,
        language: faker.helpers.arrayElement(
          Object.values(ProgrammingLanguageEnum),
        ),
        code: `// Submission by ${student.username}\n${faker.lorem.paragraphs(2)}`,
        status,
        score:
          status === SubmissionStatusEnum.Accepted
            ? 100
            : faker.number.int({ min: 0, max: 80 }),
        executionTimeMs: faker.number.int({ min: 10, max: 1000 }),
        memoryUsedMb: faker.number.int({ min: 1, max: 100 }),
        passedTestcases: passedTests,
        totalTestcases: totalTests,
        errorMessage:
          status !== SubmissionStatusEnum.Accepted
            ? faker.lorem.sentence()
            : undefined,
      });
      submissions.push(submission);
    }
  }
  await submissionRepo.save(submissions);

  console.log(
    `✅ Created ${problems.length} problems, ${tags.length} tags, ${testcases.length} testcases, ${hints.length} hints, ${solutions.length} solutions, ${submissions.length} submissions`,
  );
  return { problems, tags };
}
