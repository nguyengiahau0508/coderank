import { BaseModel, GenderEnum, RolesEnum } from "../../../shared";
import { AuthProvidersModel, TokensModel, SessionsModel } from "../../auth";


export interface UsersModel extends BaseModel {
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  birdthday: Date | null;
  gender: GenderEnum | null;
  roles: RolesEnum[];
  rating: number;
  eloRating?: number;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  tokens: TokensModel[];
  authProviders: AuthProvidersModel[];
  sessions: SessionsModel[];
}
