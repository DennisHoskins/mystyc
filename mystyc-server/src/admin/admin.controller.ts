import { Controller, Get, Post, Patch, Param, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from '@/users/user-profile.service';
import { UserRolesService } from '@/users/user-roles.service';
import { logger } from '@/util/logger';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userRolesService: UserRolesService
  ) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    logger.info('Admin fetching all users', {}, 'AdminController');
    
    const users = await this.userProfileService.findAll();
    
    logger.info('Admin users list retrieved', { count: users.length }, 'AdminController');
    return users;
  }

  @Post('users/:firebaseUid/promote')
  @Roles(UserRole.ADMIN)
  async promoteUser(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin promoting user', { targetUid: firebaseUid }, 'AdminController');
    
    try {
      await this.userRolesService.promoteToAdmin(firebaseUid);
      
      logger.info('User promoted successfully', { targetUid: firebaseUid }, 'AdminController');
      return { 
        success: true, 
        message: 'User promoted to admin successfully'
      };
    } catch (error) {
      if (error.status === 404) {
        logger.warn('User promotion failed - user not found', { targetUid: firebaseUid }, 'AdminController');
        throw new NotFoundException('User not found');
      }
      
      logger.error('User promotion failed', { 
        targetUid: firebaseUid, 
        error: error.message 
      }, 'AdminController');
      throw error;
    }
  }

  @Patch('users/:firebaseUid/revoke-admin')
  @Roles(UserRole.ADMIN)
  async revokeAdmin(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin revoking admin access', { targetUid: firebaseUid }, 'AdminController');
    
    try {
      await this.userRolesService.revokeAdminAccess(firebaseUid);
      
      logger.info('Admin access revoked successfully', { targetUid: firebaseUid }, 'AdminController');
      return { 
        success: true, 
        message: 'Admin access revoked successfully'
      };
    } catch (error) {
      if (error.status === 404) {
        logger.warn('Admin revocation failed - user not found', { targetUid: firebaseUid }, 'AdminController');
        throw new NotFoundException('User not found');
      }
      
      logger.error('Admin revocation failed', { 
        targetUid: firebaseUid, 
        error: error.message 
      }, 'AdminController');
      throw error;
    }
  }
}