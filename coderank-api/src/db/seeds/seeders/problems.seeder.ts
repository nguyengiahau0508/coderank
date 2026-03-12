import { ProblemsEntity } from "src/modules/problems/entities/problems.entity";
import { AppDataSource } from "../../data-source";
import { createProblemFactory } from "../factories/problem.factory";
import { TagsEntity } from "src/modules/problems/entities/tags.entity";
import { CP_TAGS } from "../constants/constants";
import { faker } from "@faker-js/faker/locale/zu_ZA";

export class ProblemSeeder {
  async run() {
    // const repoProblems = AppDataSource.getRepository(ProblemsEntity);
    const repoTags = AppDataSource.getRepository(TagsEntity);

    // seed tags serially to avoid duplicate key race conditions
    for (const tagName of CP_TAGS) {
      const slug = tagName.toLowerCase();
      const tagExists = await repoTags.findOneBy({ slug });
      if (!tagExists) {
        const newTag = repoTags.create({
          name: tagName,
          slug,
          description: `Description for ${tagName}`,
        });
        await repoTags.save(newTag);
      }
    }

    console.log("Seeded tags");

    // // fetch existing tag entities and use them when creating problems
    // const existingTags = await repoTags.find();

    // // seed 50 problems
    // for (let i = 0; i < 50; i++) {
    //   const problemData = createProblemFactory();
    //   // replace factory tag objects with actual Tag entities to avoid duplicate inserts
    //   problemData.tags = faker.helpers.arrayElements(existingTags, { min: 2, max: 4 });
    //   await repoProblems.save(repoProblems.create(problemData));
    // }

    // console.log("Seeded problems");
  }
}