import { applyDecorators, SetMetadata } from "@nestjs/common";

export const Owner = (entity: any, ownerField = "userId", paramId = "id") =>
  applyDecorators(
    SetMetadata("ownerEntity", entity),
    SetMetadata("ownerField", ownerField),
    SetMetadata("ownerParam", paramId)
  );
