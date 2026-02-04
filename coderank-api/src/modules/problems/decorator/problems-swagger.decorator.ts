import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";


export function ApiProblemsCreate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}