export interface BaseModel {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  authorId: string | null;
}
