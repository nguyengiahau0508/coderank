import { fa, faker } from "@faker-js/faker";
import { DifficultyEnum } from "src/common/enums/enums";
import { ProblemsEntity } from "src/modules/problems/entities/problems.entity";
import { TagsEntity } from "src/modules/problems/entities/tags.entity";
import { TestcasesEntity } from "src/modules/problems/entities/testcases.entity";
import slugify from "slugify";
import { CP_TAGS } from "../constants/constants";
import { HintsEntity } from "src/modules/problems/entities/hints.entity";

/* ================= TAG FACTORY ================= */

export function createTagsFactory(): Partial<TagsEntity> {
  const name = faker.helpers.arrayElement(CP_TAGS);

  return {
    name,
    slug: slugify(name, { lower: true }),
    description: faker.lorem.sentence(),
  };
}


/* ================= HINT GENERATOR ================= */

export function generateSumHints(): Partial<HintsEntity>[] {
  return [
    {
      hintOrder: 1,
      isPublic: true,
      content: "Read two integers from input.",
    },
    {
      hintOrder: 2,
      isPublic: true,
      content: "Compute their sum using a + b.",
    },
    {
      hintOrder: 3,
      isPublic: false,
      content: "Be careful with integer overflow in other languages like C++.",
    },
  ];
}

/* ================= TESTCASE GENERATOR (SUM PROBLEM) ================= */

export function generateSumTestcases(count = 10): Partial<TestcasesEntity>[] {
  return Array.from({ length: count }).map((_, i) => {
    const a = faker.number.int({ min: 1, max: 100 });
    const b = faker.number.int({ min: 1, max: 100 });

    return {
      order: i + 1,
      input: `${a} ${b}`,
      output: (a + b).toString(),
      isSample: i < 2, // first 2 are public samples
    };
  });
}

/* ================= PROBLEM FACTORY ================= */

export function createProblemFactory(): Partial<ProblemsEntity> {
  const a = faker.number.int({ min: 1, max: 100 });
  const b = faker.number.int({ min: 1, max: 100 });

  return {
    title: "Sum of Two Numbers",
    slug: "sum-of-two-" + faker.string.nanoid(6),
    description: `
Given two integers a and b, compute their sum.
`.trim(),

    inputDescription: "Two integers a and b in one line.",
    outputDescription: "Print the sum of a and b.",
    notes: "Note: The input numbers are guaranteed to be within the range of 32-bit signed integers.",
    isPublished: true,

    // Time limit in ms (CP realistic)
    timeLimitMs: faker.number.int({ min: 500, max: 2000 }),

    // Memory in MB (realistic CP values)
    memoryLimitMb: faker.helpers.arrayElement([64, 128, 256, 512]),

    difficulty: faker.helpers.arrayElement([
      DifficultyEnum.Easy,
      DifficultyEnum.Medium,
      DifficultyEnum.Hard,
    ]),

    // Auto-generate correct testcases
    testcases: generateSumTestcases(10) as TestcasesEntity[],
    // Auto-generate hints
    hints: generateSumHints() as HintsEntity[],
  };
}
