import { BaseModel, SessionStatusEnum } from "../../../shared";
import { UsersModel } from "../../users/models/users.model";

export interface SessionsModel extends BaseModel {
  userId: string;
  sessionToken: string;
  refreshToken: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  deviceName: string | null;
  status: SessionStatusEnum;
  expiresAt: Date;
  lastActivityAt: Date | null;
  isRememberd: boolean;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  user: UsersModel;
}
