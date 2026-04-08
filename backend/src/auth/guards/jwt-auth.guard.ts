import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that enforces JWT authentication on a route.
 * Delegates to the 'jwt' Passport strategy.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
