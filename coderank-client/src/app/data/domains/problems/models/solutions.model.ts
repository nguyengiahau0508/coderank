
import { BaseModel, ProgrammingLanguageEnum } from "../../../shared";
import { UsersModel } from "../../users/models/users.model";

export interface SolutionsModel extends BaseModel {
  problemId: string;
  title: string;
  description: string;
  code: string;
  language: ProgrammingLanguageEnum;
  upvotes: number;
  downvotes: number;
  author: Pick<UsersModel, 'id' | 'fullName' | 'username' | 'avatarUrl'> | null;
}
