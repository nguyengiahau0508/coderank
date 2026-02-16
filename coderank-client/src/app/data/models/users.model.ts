import { GenderEnum, RolesEnum } from '../enums/enums';
import { AuthProvidersModel } from './auth-provider.model';
import { BaseModel } from './base.model';
import { SessionsModel } from './sessions.model';
import { TokensModel } from './tokens.model';

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
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  tokens: TokensModel[];
  authProviders: AuthProvidersModel[];
  sessions: SessionsModel[];
}
