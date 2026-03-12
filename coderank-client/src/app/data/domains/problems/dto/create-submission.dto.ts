import { ProgrammingLanguageEnum } from '../../../shared/enums/enums';

export interface CreateSubmissionDto {
  code: string;
  language: ProgrammingLanguageEnum;
}
