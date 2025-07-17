import { Controller, UseGuards, Post, Patch, Get, Body, Req, Headers, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';
import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseUser as FirebaseUserInterface } from '@/common/interfaces/firebase-user.interface';
import { User } from '@/common/interfaces/user.interface';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { Content } from '@/common/interfaces/content.interface';
import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { UserContentService } from '@/content/user-content.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthEventLoginRegisterDto } from '@/auth-events/dto/auth-event-login-register.dto';
import { AuthEventLogoutDto } from '@/auth-events/dto/auth-event-logout.dto';
import { createServiceLogger } from '@/common/util/logger';
import { logger } from '@/common/util/logger';
import { UserRole } from '@/common/enums/roles.enum';

@Controller('users')
export class UsersController {
  private logger = createServiceLogger('UsersController');

  constructor(
    private readonly userService: UsersService,
    private readonly userProfileService: UserProfilesService,
    private readonly userContentService: UserContentService,
  ) {}

  /**
   * Registers user session on login - creates/retrieves user profile, upserts device, records login event
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @param loginRegisterDto - Login data with device info and client timestamp  
   * @param request - Express request object for IP extraction
   * @returns Promise<User> - User object with firebase user and profile data
   */
  @Post('me')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async registerSession(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() loginRegisterDto: AuthEventLoginRegisterDto,
    @Req() request: Request
  ): Promise<User> {
    this.logger.info('Registering user session via POST /users/me', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: loginRegisterDto.device.deviceId,
      authType: 'register',
      platform: loginRegisterDto.device.platform
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      const user = await this.userService.registerSession(
        firebaseUser,
        loginRegisterDto,
        serverIp
      );

      this.logger.info('Session registered successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: loginRegisterDto.device.deviceId,
        serverIp
      });

      return user;
    } catch (error) {
      this.logger.error('Session registration failed via controller', {
        uid: firebaseUser.uid,
        deviceId: loginRegisterDto.device.deviceId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Gets current authenticated user profile and data
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @returns Promise<User> - User object with firebase user and profile data
   * @throws NotFoundException if user profile not found
   */
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ auth: { limit: 20, ttl: 60000 } })
  async getCurrentUser(@FirebaseUser() firebaseUserFromDecorator): Promise<User> {
    try {
      const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
      
      const user = await this.userService.getUser(firebaseUser);
      
      this.logger.debug('Current user retrieved successfully', { uid: firebaseUser.uid });
      return user;
    } catch (error) {
      this.logger.error('Get current user failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Updates user profile information
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @param body - Update data for user profile
   * @returns Promise<UserProfile> - Updated user profile object
   */
  @Patch('update-profile')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 600000 } })
  async updateProfile(
    @FirebaseUser() firebaseUserFromDecorator, 
    @Body() body: UpdateUserProfileDto
  ): Promise<UserProfile> {
    this.logger.info('Updating profile via PATCH /update-profile', { 
      uid: firebaseUserFromDecorator.uid,
      updateFields: Object.keys(body),
      rawBody: body 
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    const userProfile = await this.userProfileService.updateProfile(firebaseUser.uid, firebaseUser.email, body)
    return userProfile;
  }

  /**
  * Updates user subscription tier (admin only)
  * @param body - Subscription update data with firebaseUid, level, and optional startDate
  * @returns Promise<UserProfile> - Updated user profile object
  */
  @Patch('subscription-tier')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async updateSubscriptionTier(
    @Body() body: { 
      firebaseUid: string; 
      level: SubscriptionLevel; 
      startDate?: string; // ISO date string
    }
  ): Promise<UserProfile> {
    this.logger.info('Admin updating user subscription tier', {
      targetFirebaseUid: body.firebaseUid,
      newLevel: body.level,
      startDate: body.startDate
    });

    try {
      const startDate = body.startDate ? new Date(body.startDate) : undefined;
      
      const userProfile = await this.userProfileService.updateSubscriptionTier(
        body.firebaseUid,
        body.level,
        startDate
      );

      this.logger.info('Subscription tier updated successfully', {
        targetFirebaseUid: body.firebaseUid,
        newLevel: body.level,
        profileId: userProfile.id
      });

      return userProfile;
    } catch (error) {
      this.logger.error('Failed to update subscription tier', {
        targetFirebaseUid: body.firebaseUid,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Updates user credit balance (admin only, for PRO users)
   * @param body - Credit update data with firebaseUid and credits amount
   * @returns Promise<UserProfile> - Updated user profile object
   */
  @Patch('credit-balance')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async updateCreditBalance(
    @Body() body: { 
      firebaseUid: string; 
      credits: number;
    }
  ): Promise<UserProfile> {
    this.logger.info('Admin updating user credit balance', {
      targetFirebaseUid: body.firebaseUid,
      credits: body.credits
    });

    try {
      const userProfile = await this.userProfileService.updateCreditBalance(
        body.firebaseUid,
        body.credits
      );

      this.logger.info('Credit balance updated successfully', {
        targetFirebaseUid: body.firebaseUid,
        newBalance: userProfile.subscription.creditBalance,
        profileId: userProfile.id
      });

      return userProfile;
    } catch (error) {
      this.logger.error('Failed to update credit balance', {
        targetFirebaseUid: body.firebaseUid,
        error: error.message
      });
      throw error;
    }
  }  

  /**
   * Logs out user by clearing device FCM token and recording logout event
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @param logoutDto - Logout data with device ID and client timestamp
   * @param request - Express request object for IP extraction
   * @returns Promise<{success: boolean, message: string}> - Logout confirmation
   */
  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async logout(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() logoutDto: AuthEventLogoutDto,
    @Req() request: Request
  ): Promise<{ success: boolean; message: string }> {
    this.logger.info('User logout via POST /users/logout', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: logoutDto.device.deviceId,
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      await this.userService.logout(
        firebaseUser,
        logoutDto,
        serverIp
      );

      this.logger.info('Logout recorded successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: logoutDto.device.deviceId,
        serverIp
      });

      return {
        success: true,
        message: 'Logout recorded successfully'
      };
    } catch (error) {
      this.logger.error('Logout recording failed via controller', {
        uid: firebaseUser.uid,
        deviceId: logoutDto.device.deviceId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Internal server logout - called when session corruption is detected
   * Uses internal secret instead of Firebase auth since token is corrupted
   */
  @Post('server-logout')
  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async serverLogout(
    @Body() body: { firebaseUid: string, deviceId: string; timestamp: string },
    @Headers('x-internal-secret') internalSecret: string,
    @Req() request: Request
  ): Promise<{ success: boolean; message: string }> {
    // Verify internal secret
    if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
      throw new UnauthorizedException('Invalid internal secret');
    }

    logger.info('Internal server logout initiated', {
      firebaseUid: body.firebaseUid,
      deviceId: body.deviceId,
      timestamp: body.timestamp
    });

    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      await this.userService.serverLogout(body.firebaseUid, body.deviceId, body.timestamp, serverIp);
      logger.info('Server logout completed', {
        deviceId: body.deviceId,
      });

      return {
        success: true,
        message: 'Internal server logout completed'
      };
    } catch (error) {
      logger.error('Server logout failed', {
        firebaseUid: body.firebaseUid,
        deviceId: body.deviceId,
        error: error.message
      });

      throw error;
    }
  }  

  /**
   * Gets user profile data without full user object (lighter endpoint)
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @returns Promise<{userProfile: UserProfile | null}> - Profile data or null if not found
   */
  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@FirebaseUser() firebaseUserFromDecorator): Promise<{ userProfile: UserProfile | null }> {
    this.logger.debug('Getting profile via GET /profile', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);

    return { userProfile };
  }

  /**
   * Gets user content data
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @returns Promise<{content: Content | null}> - Content data or null if not found
   */
  @Post('content')
  @UseGuards(FirebaseAuthGuard)
  async getContent(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() body: { deviceInfo?: any }
  ): Promise<Content | null> {
    this.logger.debug('Getting content via GET /content', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);

    const timezone = body.deviceInfo?.timezone || 'UTC';
    const userLocalDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());

    const content = await this.userContentService.getOrGenerateUserContent(firebaseUser.uid, userLocalDate);

    return content;
  }

  private transformFirebaseUser(decodedToken: any): FirebaseUserInterface {
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.displayName || decodedToken.name,
      photoURL: decodedToken.photoURL || decodedToken.picture,
      emailVerified: decodedToken.email_verified || decodedToken.emailVerified
    };
  }
  
  /**
   * Extracts client IP address from request headers with fallback chain
   * @param request - Express request object
   * @returns string - Client IP address or 'unknown' if not found
   */
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