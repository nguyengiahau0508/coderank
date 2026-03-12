import { BaseModel, TokenTypeEnum } from "../../../shared";
import { UsersModel } from "../../users";


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
