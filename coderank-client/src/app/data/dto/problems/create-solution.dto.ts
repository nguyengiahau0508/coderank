import { ProgrammingLanguageEnum } from '../../enums/enums';

export interface CreateSolutionDto {
  title: string;
  description: string;
  code: string;
  language?: ProgrammingLanguageEnum;
}
