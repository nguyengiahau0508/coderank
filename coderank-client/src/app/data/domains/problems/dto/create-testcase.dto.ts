import { TestcaseCompareTypeEnum } from '../../../shared/enums/enums';

export interface CreateTestcaseDto {
  input?: string;
  expectedOutput?: string;
  isSample?: boolean;
  compareType?: TestcaseCompareTypeEnum;
}
