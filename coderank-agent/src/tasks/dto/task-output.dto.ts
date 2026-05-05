export class TaskOutputDto {
  role?: 'system' | 'assistant' | 'tool';
  content!: string;
}
