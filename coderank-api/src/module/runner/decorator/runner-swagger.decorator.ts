import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ApiSuccessResponse, ApiErrorResponses } from 'src/common/decorators/swagger.decorator';
import { RunCodeDto } from '../dto/run-code.dto';
import { RunResultDto } from '../dto/run-result.dto';

export function ApiRun(){
  return applyDecorators(
    ApiOperation({ summary: 'Run code', description: 'Compile and execute submitted source code' }),
    ApiBody({ type: RunCodeDto }),
    ApiSuccessResponse('Execution result', RunResultDto),
    ApiErrorResponses(),
    ApiBearerAuth('JWT-auth'),
  )
}