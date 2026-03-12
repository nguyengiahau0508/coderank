import { ProgrammingLanguageEnum } from '../../../shared/enums/enums';

export interface UpdateSolutionDto {
  title?: string;
  description?: string;
  code?: string;
  language?: ProgrammingLanguageEnum;
}
