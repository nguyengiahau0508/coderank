import { SetMetadata } from '@nestjs/common';

/**
 * Key for custom response message metadata
 */
export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Key for skipping transform interceptor
 */
export const SKIP_TRANSFORM_KEY = 'skip_transform';

/**
 * Decorator to set custom response message
 * @param message - Custom message to include in response
 * 
 * @example
 * ```typescript
 * @Post()
 * @ResponseMessage('User created successfully')
 * create(@Body() dto: CreateUserDto) {
 *   return this.userService.create(dto);
 * }
 * ```
 */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * Decorator to skip response transformation
 * Use this for endpoints that need raw response (e.g., file downloads, SSE)
 * 
 * @example
 * ```typescript
 * @Get('download/:id')
 * @SkipTransform()
 * download(@Param('id') id: string, @Res() res: Response) {
 *   // Return file directly without transformation
 * }
 * ```
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
