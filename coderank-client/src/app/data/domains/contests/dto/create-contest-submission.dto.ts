import { ProgrammingLanguageEnum } from "../../../shared";


export interface CreateContestSubmissionDto {
  code: string;
  language: ProgrammingLanguageEnum;
}
