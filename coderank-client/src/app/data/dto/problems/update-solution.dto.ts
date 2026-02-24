import { ProgrammingLanguageEnum } from '../../enums/enums';

export interface UpdateSolutionDto {
  title?: string;
  description?: string;
  code?: string;
  language?: ProgrammingLanguageEnum;
}
