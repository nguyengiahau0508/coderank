import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IJwtPayload } from "src/common/interfaces/jwt-payload.interface";
import { DataSource } from "typeorm";

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user:IJwtPayload = request.user; // từ JwtAuthGuard
    const id = request.params.id;
    if (!user) throw new ForbiddenException("Unauthenticated");

    // Lấy entity từ decorator metadata
    const entityName = this.reflector.get<string>("ownerEntity", context.getHandler());
    const ownerField = this.reflector.get<string>("ownerField", context.getHandler()) || "userId";

    if (!entityName) return true; // nếu không set metadata thì bỏ qua

    const repo = this.dataSource.getRepository(entityName);
    const entity = await repo.findOne({ where: { id, [ownerField]: user.sub } });

    if (!entity) throw new ForbiddenException("Resource not found");

    if (entity[ownerField] !== user.sub && !user.roles?.includes("ADMIN" as any)) {
      throw new ForbiddenException("You are not the owner");
    }

    return true;
  }
}
