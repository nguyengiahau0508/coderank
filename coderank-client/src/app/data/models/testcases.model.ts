import { TestcaseCompareTypeEnum } from "../enums/enums";
import { BaseModel } from "./base.model";
import { ProblemsModel } from "./problems.model";

export interface TestcasesModel extends BaseModel {
  problemId: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  testcaseOrder: number;
  compareType: TestcaseCompareTypeEnum;
  problem: ProblemsModel
}
