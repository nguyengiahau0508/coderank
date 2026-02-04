import { RolesEnum } from "../enums/enums";

export interface IJwtPayload {
	userId: string;
	roles?: RolesEnum[];
}