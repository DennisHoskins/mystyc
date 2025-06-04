import { Controller, Post, Patch, Get, Body, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseService } from '@/auth/firebase.service';
import { User } from '@/common/interfaces/user.interface';
import { UserService } from './user.service';
import { UserMapperUtil } from '@/util/user-mapper';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterSessionDto } from './dto/register-session.dto';
import { createServiceLogger } from '@/util/logger';

@Controller('users')
export class UsersController {
  private logger = createServiceLogger('UsersController');

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@FirebaseUser() firebaseUserFromDecorator): Promise<User> {
    this.logger.info('Creating user via POST /users', { 
      uid: firebaseUserFromDecorator.uid,
      email: firebaseUserFromDecorator.email 
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);
    
    return this.userService.getOrCreateUser(firebaseUser);
  }

  @Post('me')
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async registerSession(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() registerSessionDto: RegisterSessionDto,
    @Req() request: Request
  ): Promise<User> {
    this.logger.info('Registering user session via POST /users/me', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: registerSessionDto.device.deviceId,
      authType: registerSessionDto.authEvent.type,
      platform: registerSessionDto.device.platform
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      const user = await this.userService.registerSession(
        firebaseUser,
        registerSessionDto,
        serverIp
      );

      this.logger.info('Session registered successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: registerSessionDto.device.deviceId,
        serverIp
      });

      return user;
    } catch (error) {
      this.logger.error('Session registration failed via controller', {
        uid: firebaseUser.uid,
        deviceId: registerSessionDto.device.deviceId,
        error: error.message
      });

      throw error;
    }
  }

  @Get('me')
  @Throttle({ auth: { limit: 20, ttl: 60000 } })
  async getCurrentUser(@Headers('authorization') authHeader: string): Promise<User> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Get current user attempt without bearer token');
      throw new UnauthorizedException('No bearer token provided');
    }
    
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const firebaseUser = await this.firebaseService.getUserById(decodedToken.uid);
      
      this.logger.debug('Getting current user', { uid: decodedToken.uid });
      
      const user = await this.userService.getOrCreateUser(firebaseUser);
      
      this.logger.debug('Current user retrieved successfully', { uid: decodedToken.uid });
      return user;
    } catch (error) {
      this.logger.error('Get current user failed', { error: error.message });
      throw error;
    }
  }

  @Patch('update-profile')
  @Throttle({ default: { limit: 100, ttl: 600000 } })
  async updateProfile(@FirebaseUser() firebaseUserFromDecorator, @Body() body: UpdateUserDto): Promise<User> {
    this.logger.info('Updating profile via PATCH /update-profile', { 
      uid: firebaseUserFromDecorator.uid,
      updateFields: Object.keys(body),
      rawBody: body 
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);

    return this.userService.updateUserProfile(firebaseUserFromDecorator.uid, body, firebaseUser);
  }

  @Post('logout')
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async logout(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() registerSessionDto: RegisterSessionDto,
    @Req() request: Request
  ): Promise<{ success: boolean; message: string }> {
    this.logger.info('User logout via POST /users/logout', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: registerSessionDto.device.deviceId,
      platform: registerSessionDto.device.platform
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      // Create logout auth event
      const logoutAuthEvent = {
        ...registerSessionDto.authEvent,
        type: 'logout' as const,
        ip: serverIp
      };

      const user = await this.userService.registerSession(
        firebaseUser,
        { ...registerSessionDto, authEvent: logoutAuthEvent },
        serverIp
      );

      this.logger.info('Logout recorded successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: registerSessionDto.device.deviceId,
        serverIp
      });

      return {
        success: true,
        message: 'Logout recorded successfully'
      };
    } catch (error) {
      this.logger.error('Logout recording failed via controller', {
        uid: firebaseUser.uid,
        deviceId: registerSessionDto.device.deviceId,
        error: error.message
      });

      throw error;
    }
  }

  @Get('profile')
  async getProfile(@FirebaseUser() firebaseUserFromDecorator): Promise<{ user: User | null }> {
    this.logger.debug('Getting profile via GET /profile', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);

    const user = await this.userService.getUserProfile(firebaseUserFromDecorator.uid, firebaseUser);
    return { user };
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    ).split(',')[0].trim();
  }
}