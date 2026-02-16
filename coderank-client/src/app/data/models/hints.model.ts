import { BaseModel } from "./base.model";
import { ProblemsModel } from "./problems.model";

export interface HintsModel extends BaseModel {
  problemId: number;
  problem: ProblemsModel;
  content: string;
  hintOrder: number;
  isPublic: boolean;
}
