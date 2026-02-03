import { RoleEnum } from "../enums/enums";

export interface IJwtPayload {
	sub: string;
	roles?: RoleEnum[];
}