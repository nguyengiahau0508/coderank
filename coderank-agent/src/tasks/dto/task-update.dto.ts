import { TaskStatus } from '../../domain/status.enums';

export class TaskUpdateDto {
  title?: string;
  status?: TaskStatus;
}
