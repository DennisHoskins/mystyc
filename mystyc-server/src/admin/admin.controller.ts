import { Controller, Get, Post, Patch, Param, NotFoundException, Query, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserProfileService } from '@/users/user-profile.service';
import { UserRolesService } from '@/users/user-roles.service';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { FirebaseService } from '@/auth/firebase.service';
import { DeviceQueryDto } from './dto/device-query.dto';
import { AuthEventQueryDto } from './dto/auth-event-query.dto';
import { SendNotificationDto } from '@/notifications/dto/send-notification.dto';
import { logger } from '@/util/logger';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userRolesService: UserRolesService,
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService,
    private readonly notificationsService: NotificationsService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    logger.info('Admin fetching all users', {}, 'AdminController');
    
    const users = await this.userProfileService.findAll();
    
    logger.info('Admin users list retrieved', { count: users.length }, 'AdminController');
    return users;
  }

  @Get('user/:firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUser(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user by Firebase UID', { firebaseUid }, 'AdminController');
    
    try {
      const user = await this.userProfileService.findByFirebaseUid(firebaseUid);
      
      if (!user) {
        logger.warn('User not found', { firebaseUid }, 'AdminController');
        throw new NotFoundException('User not found');
      }

      logger.info('User retrieved successfully', { 
        firebaseUid, 
        profileId: user.id 
      }, 'AdminController');
      
      return user;
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get user', {
        firebaseUid,
        error: error.message
      }, 'AdminController');
      
      throw error;
    }
  }

  @Post('user/:firebaseUid/promote')
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

  @Patch('user/:firebaseUid/revoke-admin')
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

  @Post('user/:firebaseUid/revoke-tokens')
  @Roles(UserRole.ADMIN)
  async revokeUserTokens(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin revoking user tokens', { targetUid: firebaseUid }, 'AdminController');
    
    try {
      // Verify user exists first
      const user = await this.userProfileService.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('Token revocation failed - user not found', { targetUid: firebaseUid }, 'AdminController');
        throw new NotFoundException('User not found');
      }

      await this.firebaseService.revokeRefreshTokens(firebaseUid);
      
      logger.info('User tokens revoked successfully', { targetUid: firebaseUid }, 'AdminController');
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
      }, 'AdminController');
      throw error;
    }
  }

  // Device management endpoints
  @Get('devices')
  @Roles(UserRole.ADMIN)
  async getAllDevices(@Query() query: DeviceQueryDto) {
    logger.info('Admin fetching devices', { query }, 'AdminController');
    
    const devices = await this.deviceService.findAll();
    
    logger.info('Admin devices list retrieved', { count: devices.length }, 'AdminController');
    return devices;
  }

  @Get('device/:deviceId')
  @Roles(UserRole.ADMIN)
  async getDevice(@Param('deviceId') deviceId: string) {
    logger.info('Admin fetching device by device ID', { deviceId }, 'AdminController');
    
    try {
      const device = await this.deviceService.findByDeviceId(deviceId);
      
      if (!device) {
        logger.warn('Device not found', { deviceId }, 'AdminController');
        throw new NotFoundException('Device not found');
      }

      logger.info('Device retrieved successfully', { 
        deviceId,
        firebaseUid: device.firebaseUid 
      }, 'AdminController');
      
      return device;
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get device', {
        deviceId,
        error: error.message
      }, 'AdminController');
      
      throw error;
    }
  }

  @Get('devices/:firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUserDevices(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user devices', { firebaseUid }, 'AdminController');
    
    const devices = await this.deviceService.findByFirebaseUid(firebaseUid);
    
    logger.info('User devices retrieved', { 
      firebaseUid, 
      count: devices.length 
    }, 'AdminController');
    
    return devices;
  }

  // Auth event management endpoints
  @Get('auth-events')
  @Roles(UserRole.ADMIN)
  async getAllAuthEvents(@Query() query: AuthEventQueryDto) {
    logger.info('Admin fetching auth events', { query }, 'AdminController');
    
    const filters: any = {};
    
    if (query.firebaseUid) filters.firebaseUid = query.firebaseUid;
    if (query.deviceId) filters.deviceId = query.deviceId;
    if (query.type) filters.type = query.type;
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);
    
    const events = await this.authEventService.findWithFilters(
      filters,
      query.limit || 50,
      query.offset || 0
    );
    
    logger.info('Admin auth events retrieved', { 
      count: events.length,
      filters
    }, 'AdminController');
    
    return events;
  }

  @Get('auth-event/:eventId')
  @Roles(UserRole.ADMIN)
  async getAuthEvent(@Param('eventId') eventId: string) {
    logger.info('Admin fetching auth event by ID', { eventId }, 'AdminController');
    
    const event = await this.authEventService.findById(eventId);
    
    if (!event) {
      logger.warn('Auth event not found', { eventId }, 'AdminController');
      throw new NotFoundException('Auth event not found');
    }

    logger.info('Auth event retrieved', { eventId }, 'AdminController');
    return event;
  }

  @Get('auth-events/:firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUserAuthEvents(
    @Param('firebaseUid') firebaseUid: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    logger.info('Admin fetching user auth events', { 
      firebaseUid,
      limit,
      offset 
    }, 'AdminController');
    
    const events = await this.authEventService.findByFirebaseUid(
      firebaseUid,
      limit || 50,
      offset || 0
    );
    
    logger.info('User auth events retrieved', { 
      firebaseUid,
      count: events.length 
    }, 'AdminController');
    
    return events;
  }

  @Get('devices/:deviceId/auth-events')
  @Roles(UserRole.ADMIN)
  async getDeviceAuthEvents(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    logger.info('Admin fetching device auth events', { 
      deviceId,
      limit,
      offset 
    }, 'AdminController');
    
    const events = await this.authEventService.findByDeviceId(
      deviceId,
      limit || 50,
      offset || 0
    );
    
    logger.info('Device auth events retrieved', { 
      deviceId,
      count: events.length 
    }, 'AdminController');
    
    return events;
  }

  @Get('auth-events/:eventId/device')
  @Roles(UserRole.ADMIN)
  async getAuthEventDevice(@Param('eventId') eventId: string) {
    logger.info('Admin fetching device for auth event', { eventId }, 'AdminController');
    
    try {
      const authEvent = await this.authEventService.findById(eventId);
      
      if (!authEvent) {
        logger.warn('Auth event not found', { eventId }, 'AdminController');
        throw new NotFoundException('Auth event not found');
      }

      const device = await this.deviceService.findByDeviceId(authEvent.deviceId);
      
      if (!device) {
        logger.warn('Device not found for auth event', { 
          eventId, 
          deviceId: authEvent.deviceId 
        }, 'AdminController');
        throw new NotFoundException('Device not found for this auth event');
      }

      logger.info('Device found for auth event', {
        eventId,
        deviceId: device.deviceId,
        firebaseUid: device.firebaseUid
      }, 'AdminController');

      return {
        authEvent,
        device
      };
    } catch (error) {
      logger.error('Failed to get device for auth event', {
        eventId,
        error: error.message
      }, 'AdminController');

      throw error;
    }
  }

  // Notification management endpoints
  @Post('notifications/test')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendTestNotification(
    @Body() body: { token: string },
    @FirebaseUserDecorator() user: FirebaseUser
  ) {
    logger.info('Sending test notification', {
      token: body.token.substring(0, 20) + '...'
    }, 'AdminController');

    try {
      // Use the new database-persisted method
      const result = await this.notificationsService.sendDirectTokenNotification(
        body.token,
        'Hello World',
        'This is a test notification from your server!',
        'test',
        user.uid
      );

      return {
        success: true,
        messageId: result.messageId,
        notificationId: result.notificationId
      };
    } catch (error) {
      logger.error('Test notification failed', { error: error.message }, 'AdminController');
      throw error;
    }
  }

  @Post('notifications/send')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ) {
    logger.info('Admin sending notification', {
      adminUid: user.uid,
      targetType: sendNotificationDto.test ? 'test' : 
                  sendNotificationDto.deviceId ? 'device' : 
                  sendNotificationDto.firebaseUid ? 'user' : 
                  sendNotificationDto.broadcast ? 'broadcast' : 'unknown',
      title: sendNotificationDto.title,
      hasCustomMessage: !!(sendNotificationDto.title || sendNotificationDto.body)
    }, 'AdminController');

    try {
      const result = await this.notificationsService.sendNotificationToTargets(
        user.uid,
        sendNotificationDto
      );

      logger.info('Notification batch completed successfully', {
        adminUid: user.uid,
        sent: result.sent,
        failed: result.failed
      }, 'AdminController');

      return result;
    } catch (error) {
      logger.error('Notification batch failed', { 
        adminUid: user.uid,
        error: error.message 
      }, 'AdminController');
      throw error;
    }
  }
}