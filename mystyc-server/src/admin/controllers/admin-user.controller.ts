import { Controller, Get, Post, Patch, Param, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from '@/users/user-profile.service';
import { UserRolesService } from '@/users/user-roles.service';
import { FirebaseService } from '@/auth/firebase.service';
import { logger } from '@/util/logger';

@Controller('admin/user')
export class AdminUserController {

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userRolesService: UserRolesService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Get(':firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUser(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user by Firebase UID', { firebaseUid }, 'AdminUserController');
    
    try {
      const user = await this.userProfileService.findByFirebaseUid(firebaseUid);
      
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

  @Post(':firebaseUid/promote')
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

  @Patch(':firebaseUid/revoke-admin')
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

  @Post(':firebaseUid/revoke-tokens')
  @Roles(UserRole.ADMIN)
  async revokeUserTokens(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin revoking user tokens', { targetUid: firebaseUid }, 'AdminUserController');
    
    try {
      // Verify user exists first
      const user = await this.userProfileService.findByFirebaseUid(firebaseUid);
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