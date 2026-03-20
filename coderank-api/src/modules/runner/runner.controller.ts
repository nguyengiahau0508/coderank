// coderunner/runner.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { RunCodeDto } from './dto/run-code.dto';
import { ApiRun } from './decorator/runner-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RunnerService } from './services/runner.service';

@ApiTags('Runner')
@Controller('runner')
export class RunnerController {
  constructor(private runner: RunnerService) {}

  @Post('run')
  @ApiRun()
  async run(@Body() dto: RunCodeDto) {
    const result = await this.runner.runCode(dto);
    console.log('Run code result:', result);
    return result;
  }
}
