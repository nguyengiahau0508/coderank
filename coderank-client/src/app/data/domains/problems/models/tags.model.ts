import { BaseModel } from "../../../shared";
import { ProblemsModel } from "./problems.model";

export interface TagsModel extends BaseModel {
  name: string;
  slug: string;
  description: string | null;
  problems: ProblemsModel[];
}
