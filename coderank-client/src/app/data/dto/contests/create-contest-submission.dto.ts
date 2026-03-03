import { ProgrammingLanguageEnum } from '../../enums/enums';

export interface CreateContestSubmissionDto {
  code: string;
  language: ProgrammingLanguageEnum;
}
