import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY, ThrottleOptions } from '../decorators';

interface ThrottleRecord {
  count: number;
  resetTime: number;
}

/**
 * Throttle Guard
 * 
 * Rate limiting guard to prevent abuse.
 * Can be applied globally, per-controller, or per-endpoint.
 * 
 * Note: This is a simple in-memory implementation.
 * For production, consider using Redis-based throttling.
 * 
 * @example
 * ```typescript
 * @Throttle({ limit: 5, ttl: 60 })  // 5 requests per 60 seconds
 * @UseGuards(ThrottleGuard)
 * @Post('submissions')
 * createSubmission() { ... }
 * ```
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly storage = new Map<string, ThrottleRecord>();
  
  // Default limits
  private readonly defaultLimit = 100;
  private readonly defaultTtl = 60; // seconds

  constructor(private reflector: Reflector) {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const limit = options?.limit ?? this.defaultLimit;
    const ttl = options?.ttl ?? this.defaultTtl;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Create unique key from IP + route + user (if authenticated)
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const route = `${request.method}:${request.route?.path || request.url}`;
    const userId = request.user?.userId || 'anonymous';
    const key = `${ip}:${route}:${userId}`;

    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now > record.resetTime) {
      // First request or expired record
      this.storage.set(key, {
        count: 1,
        resetTime: now + ttl * 1000,
      });
      this.setHeaders(response, limit, limit - 1, ttl);
      return true;
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      this.setHeaders(response, limit, 0, retryAfter);
      
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: `Rate limit exceeded. Try again in ${retryAfter} seconds`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    const remaining = limit - record.count;
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    this.setHeaders(response, limit, remaining, resetIn);

    return true;
  }

  private setHeaders(response: any, limit: number, remaining: number, reset: number): void {
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    response.setHeader('X-RateLimit-Reset', reset);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      if (now > record.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}
