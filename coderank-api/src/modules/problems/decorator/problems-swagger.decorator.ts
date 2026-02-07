import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";


export function ApiProblemsCreate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsGet(){
    return applyDecorators(
        // No authentication required for getting a problem
    )
}

export function ApiProblemsList(){
    return applyDecorators(
        // No authentication required for listing problems
    )
}

export function ApiProblemsUpdate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsDelete(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsTestcaseCreate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsTestcaseUpdate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsTestcaseDelete(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsTagCreate(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}

export function ApiProblemsTagDelete(){
    return applyDecorators(
        ApiBearerAuth('JWT-auth')
    )
}


