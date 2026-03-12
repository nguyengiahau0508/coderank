import { ContestStatusEnum } from "../../../shared";


export interface PaginationQueryContestsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContestStatusEnum;
  isPublic?: boolean;
  isRated?: boolean;
}
