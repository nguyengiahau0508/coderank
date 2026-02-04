import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Active User Guard
 * 
 * Ensures the authenticated user's account is active and verified.
 * Should be used after JwtAuthGuard.
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, ActiveUserGuard)
 * @Post('submissions')
 * createSubmission() { ... }
 * ```
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Check if user account is active
    if (user.isActive === false) {
      throw new ForbiddenException('Your account has been deactivated');
    }

    // Check if email is verified (if required)
    if (user.isEmailVerified === false) {
      throw new ForbiddenException('Please verify your email address');
    }

    return true;
  }
}
