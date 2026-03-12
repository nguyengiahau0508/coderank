import { BaseModel, DifficultyEnum } from "../../../shared";
import { HintsModel } from "./hints.model";
import { TagsModel } from "./tags.model";
import { TestcasesModel } from "./testcases.model";
import { UsersModel } from "../../users/models/users.model";

export interface ProblemsModel extends BaseModel {
  title: string;
  slug: string;
  description: string | null;
  inputDescription: string | null;
  outputDescription: string | null;
  notes: string | null;
  timeLimitMs: number;
  memoryLimitMb: number;
  difficulty: DifficultyEnum;
  points: number;
  isPublished: boolean;
  author: UsersModel;
  tags: TagsModel[];
  testcases: TestcasesModel[];
  hints: HintsModel[];
}
