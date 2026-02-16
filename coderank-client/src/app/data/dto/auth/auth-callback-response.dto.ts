import { UsersModel } from '../../models/users.model';

export interface AuthCallbackResponse {
  accessToken: string;
  user: UsersModel;
}
