import { ProgrammingLanguageEnum } from '../../enums/enums';

export interface CreateSubmissionDto {
  code: string;
  language: ProgrammingLanguageEnum;
}
