import { AuthProvidersEnum, BaseModel } from "../../../shared";
import { UsersModel } from "../../users/models/users.model";

export interface AuthProvidersModel extends BaseModel {
  userId: string;
  provider: AuthProvidersEnum;
  providerId: string;
  passwordHash: string | null;
  providerEmail: string | null;
  providerName: string | null;
  providerAvatar: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  lastUsedAt: Date | null;
  user: UsersModel;
}
