import { TokenTypeEnum } from "../enums/enums";
import { BaseModel } from "./base.model";
import { UsersModel } from "./users.model";

export interface TokensModel extends BaseModel {
  userId: string;
  tokenHash: string;
  type: TokenTypeEnum;
  isRevoked: boolean;
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: string | null;
  user: UsersModel;
}
