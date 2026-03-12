import { ProgrammingLanguageEnum, SubmissionStatusEnum } from "../../../shared/enums/enums";
import { BaseModel } from "../../../shared";
import { ProblemsModel } from "./problems.model";
import { UsersModel } from "../../users/models/users.model";

export interface SubmissionsModel extends BaseModel {
  problemId: number;
  code: string;
  language: ProgrammingLanguageEnum;
  status: SubmissionStatusEnum;
  score: number;
  executionTimeMs: number | null;
  memoryUsageMb: number | null;
  passedTestcases: number;
  totalTestcases: number;
  errorMessage: string | null;
  output: string | null;
  problem: ProblemsModel;
  author: UsersModel | null;
}

