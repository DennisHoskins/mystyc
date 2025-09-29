import { Controller, UseGuards, Post, Patch, Get, Body, Req, Headers, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { z } from 'zod';
import { FirebaseUser as FirebaseUserInterface, User, UserProfile, PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants/';
import { LoginRegisterRequestSchema, LogoutRequestSchema, UpdateUserProfileSchema } from 'mystyc-common/schemas/requests';
import { PlanetaryDegrees } from 'mystyc-common/interfaces';

import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { logger, createServiceLogger } from '@/common/util/logger';

import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { OpenAIUserService } from '@/openai/openai-user.service';
import { AstrologyService } from '@/astrology/services/astrology.service'; 
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';
import { AstrologyComplete } from 'mystyc-common/interfaces';

@Controller('users')
export class UsersController {
  private logger = createServiceLogger('UsersController');

  constructor(
    private readonly userService: UsersService,
    private readonly userProfileService: UserProfilesService,
    private readonly openAiUserService: OpenAIUserService,
    private readonly astrologyService: AstrologyService,
    private readonly astrologyDataService: AstrologyDataService,
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
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface,
    @Body(new ZodValidationPipe(LoginRegisterRequestSchema)) body: z.infer<typeof LoginRegisterRequestSchema>,
    @Req() request: Request
  ): Promise<User> {
    this.logger.info('Registering user session via POST /users/me', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: body.device.deviceId,
      authType: 'register',
      platform: body.device.platform
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      const user = await this.userService.registerSession(
        firebaseUser,
        body,
        serverIp
      );

      this.logger.info('Session registered successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: body.device.deviceId,
        serverIp
      });

      return user;
    } catch (error) {
      this.logger.error('Session registration failed via controller', {
        uid: firebaseUser.uid,
        deviceId: body.device.deviceId,
        error
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
  async getCurrentUser(@FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface): Promise<User> {
    try {
      const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
      
      const user = await this.userService.getUser(firebaseUser);
      
      this.logger.debug('Current user retrieved successfully', { uid: firebaseUser.uid });
      return user;
    } catch (error) {
      this.logger.error('Get current user failed', { error });
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
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface, 
    @Body(new ZodValidationPipe(UpdateUserProfileSchema)) body: z.infer<typeof UpdateUserProfileSchema>
  ): Promise<UserProfile> {
    this.logger.info('Updating profile via PATCH /update-profile', { 
      uid: firebaseUserFromDecorator.uid,
      updateFields: Object.keys(body),
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    const userProfile = await this.userProfileService.updateProfile(firebaseUser.uid, firebaseUser.email!, body)
    return userProfile;
  }

  @Post('start-subscription')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async startSubscription(
    @FirebaseUser() firebaseUser: FirebaseUserInterface,
    @Body() body: { 
      priceId: string;
    }
  ): Promise<{ sessionUrl: string | null }> {
    try {
      const session = await this.userService.createSubscriptionSession(
        firebaseUser.uid,
        body.priceId,
        'https://mystyc.app/subscribe/success',
        'https://mystyc.app/subscribe/error'
      );

      return { sessionUrl: session.url };
    } catch (error) {
      logger.error('Failed to start subscription', {
        uid: firebaseUser.uid,
      });
      throw error;
    }
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
        error
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
        error
      });
      throw error;
    }
  }  

  /**
   * Creates a Stripe customer portal session for billing management
   * @param firebaseUser - Firebase user from auth guard
   * @param body - Request body containing return URL for after portal visit
   * @returns Promise<{portalUrl: string}> - Secure Stripe portal URL
   */
  @Post('billing-portal')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createBillingPortalSession(
    @FirebaseUser() firebaseUser: FirebaseUserInterface,
    @Body() body: { returnUrl: string }
  ): Promise<{ portalUrl: string }> {
    const portalUrl = await this.userService.createCustomerPortalSession(
      firebaseUser.uid,
      body.returnUrl
    );
    return { portalUrl };
  }

  /**
   * Cancels user's active subscription immediately with no refund
   * @param firebaseUser - Firebase user from auth guard
   * @returns Promise<{success: boolean, message: string}> - Cancellation confirmation
   */
  @Post('cancel-subscription')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async cancelSubscription(
    @FirebaseUser() firebaseUser: FirebaseUserInterface
  ): Promise<{ success: boolean; message: string }> {
    await this.userService.cancelSubscription(firebaseUser.uid);
    return { 
      success: true, 
      message: 'Subscription cancelled successfully' 
    };
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
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface,
    @Body(new ZodValidationPipe(LogoutRequestSchema)) body: z.infer<typeof LogoutRequestSchema>,
    @Req() request: Request
  ): Promise<{ success: boolean; message: string }> {
    this.logger.info('User logout via POST /users/logout', {
      uid: firebaseUserFromDecorator.uid,
      deviceId: body.device.deviceId,
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    
    // Extract server IP from request
    const serverIp = this.getClientIp(request);
    
    try {
      await this.userService.logout(
        firebaseUser,
        body,
        serverIp
      );

      this.logger.info('Logout recorded successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: body.device.deviceId,
        serverIp
      });

      return {
        success: true,
        message: 'Logout recorded successfully'
      };
    } catch (error) {
      this.logger.error('Logout recording failed via controller', {
        uid: firebaseUser.uid,
        deviceId: body.device.deviceId,
        error
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
        error
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
  async getProfile(@FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface): Promise<{ userProfile: UserProfile | null }> {
    this.logger.debug('Getting profile via GET /profile', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);

    return { userProfile };
  }

  /**
   * Gets user astrology data - calculates if missing, returns if exists
   * @param firebaseUserFromDecorator - Firebase user from auth guard
   * @returns Promise<User | null> - User object with astrology data
   */
  @Post('calculate-astrology')
  @UseGuards(FirebaseAuthGuard)
  async getAstrologyData(
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface,
    @Body() body: { deviceInfo?: any }
  ): Promise<{user: User, astrology: AstrologyComplete} | null> {
    this.logger.debug('Getting astrology data via POST /calculate-astrology', { 
      uid: firebaseUserFromDecorator.uid 
    });

    const firebaseUser = this.transformFirebaseUser(firebaseUserFromDecorator);
    const user = await this.userService.getUser(firebaseUser);
    
    // Check if calculated astrology data already exists
    if (user.userProfile.astrology && user.userProfile.astrology.summary) {
      const astrologyComplete = await this.astrologyDataService.assembleCompleteAstrologyData(user.userProfile.astrology)
      return {
        user,
        astrology: astrologyComplete
      };
    }

    // Calculate astrology if user has complete birth data
    const birthLocation = user.userProfile.birthLocation as any;
    if (user.userProfile.dateOfBirth && 
        user.userProfile.timeOfBirth && 
        birthLocation) {
      try {
        // Calculate core signs
        const coreAstrology = await this.astrologyService.calculateCoreAstrology(
          user.userProfile.dateOfBirth as Date,
          user.userProfile.timeOfBirth,
          birthLocation.timezone.name,
          birthLocation.coordinates
        );
        
        const signs: Record<PlanetType, ZodiacSignType> = {
          Sun: coreAstrology.sunSign,
          Moon: coreAstrology.moonSign,
          Rising: coreAstrology.risingSign,
          Venus: coreAstrology.venusSign!,
          Mars: coreAstrology.marsSign!
        };

        const positions: Record<PlanetType, PlanetaryDegrees> = {
          Sun: coreAstrology.sunPosition,
          Moon: coreAstrology.moonPosition,
          Rising: coreAstrology.risingPosition,
          Venus: coreAstrology.venusPosition!,
          Mars: coreAstrology.marsPosition!
        };

        // Calculate interaction scores
        const calculatedData = await this.astrologyDataService.calculateUserAstrologyData(signs, positions);

        const astrologyComplete = await this.astrologyDataService.assembleCompleteAstrologyData(calculatedData)

        const calculatedDataWithSummary = await this.openAiUserService.getUserAstrologicalProfileSummary(firebaseUser.uid, signs, calculatedData, astrologyComplete);

        // Store calculated data
        const updatedProfile = await this.userProfileService.updateProfile(
          firebaseUser.uid,
          firebaseUser.email!,
          { astrology: calculatedDataWithSummary }
        );
        
        user.userProfile = updatedProfile;
        
        this.logger.info('Astrology data calculated and stored successfully', {
          uid: firebaseUser.uid,
          signs: signs
        });

        return {
          user,
          astrology: astrologyComplete
        }
      } catch (error) {
        this.logger.error('Failed to calculate astrology data', {
          uid: firebaseUser.uid,
          error
        });
        throw error;
      }
    }

    return null;
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