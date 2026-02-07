import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IJwtPayload } from "src/common/interfaces/jwt-payload.interface";
import { DataSource } from "typeorm";
import { IS_PUBLIC_KEY } from "../decorators";

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: IJwtPayload = request.user; // từ JwtAuthGuard
    if (!user) throw new ForbiddenException("Unauthenticated");

    // Lấy entity từ decorator metadata
    const entityName = this.reflector.get<string>("ownerEntity", context.getHandler());
    const ownerField = this.reflector.get<string>("ownerField", context.getHandler()) || "userId";
    const paramId = this.reflector.get<string>("ownerParam", context.getHandler()) || "id";
    const id = request.params[paramId];

    if (!entityName) return true; // nếu không set metadata thì bỏ qua
    const repo = this.dataSource.getRepository(entityName);
    const entity = await repo.findOne({ where: { id, [ownerField]: user.userId } });
    if (!entity) throw new ForbiddenException("Resource not found");
    if (entity[ownerField] !== user.userId && !user.roles?.includes("ADMIN" as any)) {
      throw new ForbiddenException("You are not the owner");
    }

    return true;
  }
}
  