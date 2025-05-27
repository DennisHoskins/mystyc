import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseService } from './firebase.service';
import { Public } from '@/common/decorators/public.decorator';
import { logger } from '@/util/logger';
import { VerifyTokenDto } from './dto/verify-token.dto'; // Added new DTO import

@Controller('auth')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('verify-token')
  @Public()
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  async verifyToken(@Body() body: VerifyTokenDto) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(body.idToken);
      logger.info('Token verified successfully', { uid: decodedToken.uid }, 'FirebaseController');

      return {
        valid: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        decoded: decodedToken,
      };
    } catch (error) {
      logger.error('Token verification failed', { error: error.message }, 'FirebaseController');
      throw error; // FirebaseService already throws UnauthorizedException
    }
  }
}