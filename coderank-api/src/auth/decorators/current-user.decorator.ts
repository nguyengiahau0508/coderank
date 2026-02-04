import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Type for the user payload attached to the request
 */
export interface UserPayload {
  userId: string;
  roles: string[];
  isActive?: boolean;
  isEmailVerified?: boolean;
}
