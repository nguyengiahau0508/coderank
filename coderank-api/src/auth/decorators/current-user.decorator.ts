import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

/**
 * Current User Decorator
 * 
 * Extracts the current user from the request object.
 * Can optionally extract a specific property from the user.
 * 
 * @example
 * ```typescript
 * // Get entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserPayload) {
 *   return user;
 * }
 * 
 * // Get specific property
 * @Get('my-submissions')
 * getMySubmissions(@CurrentUser('userId') userId: string) {
 *   return this.submissionService.findByUser(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IJwtPayload = request.user;
    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);