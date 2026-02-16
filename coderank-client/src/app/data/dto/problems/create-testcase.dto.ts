import { TestcaseCompareTypeEnum } from '../../enums/enums';

export interface CreateTestcaseDto {
  input?: string;
  output?: string;
  isSample?: boolean;
  isHidden?: boolean;
  compareType?: TestcaseCompareTypeEnum;
}
