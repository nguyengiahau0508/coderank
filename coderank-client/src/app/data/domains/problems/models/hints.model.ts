import { BaseModel } from "../../../shared";
import { ProblemsModel } from "./problems.model";

export interface HintsModel extends BaseModel {
  problemId: number;
  problem: ProblemsModel;
  content: string;
  hintOrder: number;
  isPublic: boolean;
}
