import {
  ApiStringProperty,
  ApiStringOptional,
  ApiIntProperty,
  ApiEnumProperty,
} from 'src/common/decorators/api-property.decorator';

export enum RunStatusEnum {
  OK = 'OK',
  TLE = 'TLE',
  MLE = 'MLE',
  RE = 'RE',
  CE = 'CE',
}

export class RunResultDto {
  @ApiEnumProperty(
    'Execution status',
    RunStatusEnum,
    'RunStatusEnum',
    RunStatusEnum.OK,
    RunStatusEnum.OK,
  )
  status: RunStatusEnum;

  @ApiStringProperty('Standard output', '')
  stdout: string;

  @ApiStringOptional('Standard error', '')
  stderr?: string;

  @ApiIntProperty('Execution time (ms)', 0)
  time: number; // ms

  @ApiIntProperty('Memory used (MB)', 0)
  memory: number; // MB (optional)
}
