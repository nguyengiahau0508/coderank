import { ProgrammingLanguageEnum } from '../../../shared/enums/enums';

export interface CreateSolutionDto {
  title: string;
  description: string;
  code: string;
  language?: ProgrammingLanguageEnum;
}
