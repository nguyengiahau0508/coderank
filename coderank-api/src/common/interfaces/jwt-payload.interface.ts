import { RolesEnum } from "../enums/enums";

export interface IJwtPayload {
	sub: string;
	roles?: RolesEnum[];
}