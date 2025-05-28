import { Controller, Post, Patch, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { User } from '@/common/interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UserMapperUtil } from '@/util/user-mapper.util';
import { createServiceLogger } from '@/util/logger';
import { FirebaseService } from '@/auth/firebase.service';

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

  @Get('profile')
  async getProfile(@FirebaseUser() firebaseUserFromDecorator): Promise<{ user: User | null }> {
    this.logger.debug('Getting profile via GET /profile', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = UserMapperUtil.transformFirebaseUser(firebaseUserFromDecorator);

    const user = await this.userService.getUserProfile(firebaseUserFromDecorator.uid, firebaseUser);
    return { user };
  }
}