import { ProgrammingLanguageEnum } from '../enums/enums';
import { BaseModel } from './base.model';
import { UsersModel } from './users.model';

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
