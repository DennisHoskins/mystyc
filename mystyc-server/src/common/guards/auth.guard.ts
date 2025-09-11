import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FirebaseService } from '@/auth/firebase.service';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { logger } from '@/common/util/logger';

interface FirebaseAuthError extends Error { code: string; }
function isFirebaseAuthError(e: unknown): e is FirebaseAuthError {
  return (
    e instanceof Error &&
    'code' in e &&
    typeof (e as any).code === 'string'
  );
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
 constructor(
   private firebaseService: FirebaseService,
   private reflector: Reflector
 ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.security('Missing or invalid auth header', {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        endpoint: request.url,
        method: request.method
      });
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      
      request.user = decodedToken;
      
      logger.debug('Auth guard passed', { 
        uid: decodedToken.uid,
        endpoint: request.url,
        method: request.method
      });
      
      return true;
    } catch (err: unknown) {
      // Handle revoked tokens specifically

    const error = err instanceof Error ? err : new Error(String(err));

    if (isFirebaseAuthError(err) && err.code === 'auth/id-token-revoked') {
      logger.security('Revoked token access attempt', {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          endpoint: request.url,
          method: request.method,
          error
        });
        throw new UnauthorizedException('Token revoked by admin');
      }

      logger.security('Invalid token attempt', {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        endpoint: request.url,
        method: request.method,
        error
      });
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}