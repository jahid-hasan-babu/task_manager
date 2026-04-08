import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated user from the request object.
 * Must be used with JwtAuthGuard — req.user is set by the JWT strategy.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: User) { }
 *
 *   // Or extract a single field:
 *   @Get('profile')
 *   getProfile(@CurrentUser('id') userId: string) { }
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return field ? user?.[field] : user;
  },
);
