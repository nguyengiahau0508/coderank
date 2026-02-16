import { DifficultyEnum } from '../../enums/enums';

export interface CreateProblemDto {
  title: string;
  slug?: string;
  description?: string;
  inputDescription?: string;
  outputDescription?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  difficulty?: DifficultyEnum;
  isPublished?: boolean;
  points?: number;
}
