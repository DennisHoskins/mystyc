import { Controller, Get, Post, Patch, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from '@/users/user-profile.service';
import { UserRolesService } from '@/users/user-roles.service';
import { FirebaseService } from '@/auth/firebase.service';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { AdminController } from './admin.controller';
import { logger } from '@/common/util/logger';

@Controller('admin/user')
export class AdminUserController extends AdminController<UserProfile> {
  protected serviceName = 'User';

  constructor(
    protected service: UserProfileService,
    private readonly userRolesService: UserRolesService,
    private readonly firebaseService: FirebaseService,
    private readonly deviceService: DeviceService,
    private readonly authEventsService: AuthEventService,
  ) {
    super();
  }

  // GET Methods (Read Operations)

  /**
   * Finds user profile by Firebase UID, throws NotFoundException if not found (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<UserProfile> - User profile object
   * @throws NotFoundException when user profile not found
   */
  @Get(':firebaseUid')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUser(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user by Firebase UID', { firebaseUid }, 'AdminUserController');
    
    try {
      const user = await this.service.findByFirebaseUid(firebaseUid);
      
      if (!user) {
        logger.warn('User not found', { firebaseUid }, 'AdminUserController');
        throw new NotFoundException('User not found');
      }

      logger.info('User retrieved successfully', { 
        firebaseUid, 
        profileId: user.id 
      }, 'AdminUserController');
      
      return user;
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get user', {
        firebaseUid,
        error: error.message
      }, 'AdminUserController');
      
      throw error;
    }
  }

  /**
   * Finds all devices registered to a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<Device[]> - Array of user's devices
   */
  @Get(':firebaseUid/devices')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserDevices(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user devices', { firebaseUid }, 'AdminUserController');
    
    const devices = await this.deviceService.findByFirebaseUid(firebaseUid);
    
    logger.info('User devices retrieved', { 
      firebaseUid, 
      count: devices.length 
    }, 'AdminUserController');
    
    return devices;
  }

  /**
   * Finds all auth events for a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<AuthEvent[]> - Array of user's auth events, newest first
   */
  @Get(':firebaseUid/auth-events')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserAuthEvents(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user auth events', { firebaseUid }, 'AdminUserController');
    
    const authEvents = await this.authEventsService.findByFirebaseUid(firebaseUid);
    
    logger.info('User auth events retrieved', { 
      firebaseUid, 
      count: authEvents.length 
    }, 'AdminUserController');
    
    return authEvents;
  }

  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Promotes user to admin role (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<{success: boolean, message: string}> - Success response
   * @throws NotFoundException when user not found
   */
  @Post(':firebaseUid/promote')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async promoteAdmin(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin promoting user', { targetUid: firebaseUid }, 'AdminUserController');
    
    try {
      await this.userRolesService.promoteToAdmin(firebaseUid);
      
      logger.info('User promoted successfully', { targetUid: firebaseUid }, 'AdminUserController');
      return { 
        success: true, 
        message: 'User promoted to admin successfully'
      };
    } catch (error) {
      if (error.status === 404) {
        logger.warn('User promotion failed - user not found', { targetUid: firebaseUid }, 'AdminUserController');
        throw new NotFoundException('User not found');
      }
      
      logger.error('User promotion failed', { 
        targetUid: firebaseUid, 
        error: error.message 
      }, 'AdminUserController');
      throw error;
    }
  }

  /**
   * Revokes admin access from user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<{success: boolean, message: string}> - Success response
   * @throws NotFoundException when user not found
   */
  @Patch(':firebaseUid/revoke-admin')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async revokeAdmin(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin revoking admin access', { targetUid: firebaseUid }, 'AdminUserController');
    
    try {
      await this.userRolesService.revokeAdminAccess(firebaseUid);
      
      logger.info('Admin access revoked successfully', { targetUid: firebaseUid }, 'AdminUserController');
      return { 
        success: true, 
        message: 'Admin access revoked successfully'
      };
    } catch (error) {
      if (error.status === 404) {
        logger.warn('Admin revocation failed - user not found', { targetUid: firebaseUid }, 'AdminUserController');
        throw new NotFoundException('User not found');
      }
      
      logger.error('Admin revocation failed', { 
        targetUid: firebaseUid, 
        error: error.message 
      }, 'AdminUserController');
      throw error;
    }
  }

  /**
   * Revokes all Firebase refresh tokens for user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<{success: boolean, message: string}> - Success response
   * @throws NotFoundException when user not found
   */
  @Post(':firebaseUid/revoke-tokens')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async revokeUserTokens(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin revoking user tokens', { targetUid: firebaseUid }, 'AdminUserController');
    
    try {
      // Verify user exists first
      const user = await this.service.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('Token revocation failed - user not found', { targetUid: firebaseUid }, 'AdminUserController');
        throw new NotFoundException('User not found');
      }

      await this.firebaseService.revokeRefreshTokens(firebaseUid);
      
      logger.info('User tokens revoked successfully', { targetUid: firebaseUid }, 'AdminUserController');
      return { 
        success: true, 
        message: 'User tokens revoked successfully'
      };
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      
      logger.error('Token revocation failed', { 
        targetUid: firebaseUid, 
        error: error.message 
      }, 'AdminUserController');
      throw error;
    }
  }
}