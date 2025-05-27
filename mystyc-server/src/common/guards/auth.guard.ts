import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { FirebaseService } from '@/auth/firebase.service';
import { logger } from '@/util/logger';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
 constructor(private firebaseService: FirebaseService) {}

 async canActivate(context: ExecutionContext): Promise<boolean> {
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
     
     // Add the user to the request object
     request.user = decodedToken;
     
     logger.debug('Auth guard passed', { 
       uid: decodedToken.uid,
       endpoint: request.url,
       method: request.method
     });
     
     return true;
   } catch (error) {
     logger.security('Invalid token attempt', {
       ip: request.ip,
       userAgent: request.headers['user-agent'],
       endpoint: request.url,
       method: request.method,
       error: error.message
     });
     throw new UnauthorizedException('Invalid Firebase token');
   }
 }
}