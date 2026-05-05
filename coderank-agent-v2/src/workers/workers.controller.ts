import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkerCreateDto } from './dto/worker-create.dto';
import { WorkerObserveCompletionDto } from './dto/worker-observe-completion.dto';
import { WorkerObserveDto } from './dto/worker-observe.dto';
import { WorkerSendPromptDto } from './dto/worker-send-prompt.dto';
import { WorkerRegistryService } from './worker-registry.service';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workers: WorkerRegistryService) {}

  @Post()
  async createWorker(@Body() dto: WorkerCreateDto) {
    return this.workers.create(dto);
  }

  @Get(':id')
  getWorker(@Param('id') id: string) {
    return this.workers.get(id);
  }

  @Get()
  listWorkers() {
    return this.workers.list();
  }

  @Post(':id/observe')
  async observe(@Param('id') id: string, @Body() dto: WorkerObserveDto) {
    return this.workers.observe(id, dto.screenText);
  }

  @Post(':id/resolve-trust')
  async resolveTrust(@Param('id') id: string) {
    return this.workers.resolveTrust(id);
  }

  @Post(':id/grant-tool-permission')
  async grantToolPermission(@Param('id') id: string) {
    return this.workers.grantToolPermission(id);
  }

  @Post(':id/await-ready')
  async awaitReady(@Param('id') id: string) {
    return this.workers.awaitReady(id);
  }

  @Post(':id/send-prompt')
  async sendPrompt(@Param('id') id: string, @Body() dto: WorkerSendPromptDto) {
    return this.workers.sendPrompt(id, dto.prompt);
  }

  @Post(':id/observe-completion')
  async observeCompletion(
    @Param('id') id: string,
    @Body() dto: WorkerObserveCompletionDto,
  ) {
    return this.workers.observeCompletion(id, dto.screenText);
  }

  @Post(':id/observe-startup-timeout')
  async observeStartupTimeout(@Param('id') id: string) {
    return this.workers.observeStartupTimeout(id);
  }
}
