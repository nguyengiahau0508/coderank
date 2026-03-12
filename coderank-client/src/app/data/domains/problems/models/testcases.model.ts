import { TestcaseCompareTypeEnum } from "../../../shared/enums/enums";
import { BaseModel } from "../../../shared";
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
