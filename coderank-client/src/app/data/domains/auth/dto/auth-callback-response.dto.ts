import { UsersModel } from "../../users";

export interface AuthCallbackResponse {
  accessToken: string;
  user: UsersModel;
}
