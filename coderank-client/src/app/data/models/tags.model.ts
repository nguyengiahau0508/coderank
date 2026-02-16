import { BaseModel } from "./base.model";
import { ProblemsModel } from "./problems.model";

export interface TagsModel extends BaseModel {
  name: string;
  slug: string;
  description: string | null;
  problems: ProblemsModel[];
}
