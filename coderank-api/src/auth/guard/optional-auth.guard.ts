import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional Authentication Guard
 * 
 * Allows both authenticated and unauthenticated access.
 * If a valid token is provided, user info will be attached to request.
 * If no token or invalid token, request proceeds without user info.
 * 
 * Useful for endpoints that provide different responses based on auth status.
 * 
 * @example
 * ```typescript
 * @UseGuards(OptionalAuthGuard)
 * @Get('problems/:id')
 * getProblem(@Req() req: Request) {
 *   if (req.user) {
 *     // Return with user's submission history
 *   } else {
 *     // Return basic problem info
 *   }
 * }
 * ```
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser): TUser | null {
    // Don't throw error, just return null if not authenticated
    return user || null;
  }
}
