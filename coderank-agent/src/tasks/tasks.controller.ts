import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskOutputDto } from './dto/task-output.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { TaskRegistryService } from './task-registry.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TaskRegistryService) {}

  @Post()
  createTask(@Body() dto: TaskCreateDto) {
    return this.tasks.create(dto);
  }

  @Get(':id')
  getTask(@Param('id') id: string) {
    return this.tasks.get(id);
  }

  @Get()
  listTasks() {
    return this.tasks.list();
  }

  @Post(':id/stop')
  stopTask(@Param('id') id: string) {
    return this.tasks.stop(id);
  }

  @Patch(':id')
  updateTask(@Param('id') id: string, @Body() dto: TaskUpdateDto) {
    return this.tasks.update(id, dto);
  }

  @Post(':id/output')
  appendTaskOutput(@Param('id') id: string, @Body() dto: TaskOutputDto) {
    return this.tasks.appendOutput(id, dto);
  }
}
