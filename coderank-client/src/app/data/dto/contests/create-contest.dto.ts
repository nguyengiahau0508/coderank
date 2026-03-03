import { ContestStatusEnum } from '../../enums/enums';

export interface CreateContestDto {
  title: string;
  slug: string;
  description?: string;
  rules?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  status?: ContestStatusEnum;
  isPublic?: boolean;
  isRated?: boolean;
  maxParticipants?: number;
  password?: string;
}
