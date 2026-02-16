import { DifficultyEnum } from '../../enums/enums';

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  difficulty?: DifficultyEnum;
  tagIds?: string[];
  isPublished?: boolean;
  minPoints?: number;
  maxPoints?: number;
}
