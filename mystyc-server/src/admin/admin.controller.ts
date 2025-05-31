import { Controller, Get, Post, Patch, Param, NotFoundException, Query } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from '@/users/user-profile.service';
import { UserRolesService } from '@/users/user-roles.service';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { DeviceQueryDto } from './dto/device-query.dto';
import { AuthEventQueryDto } from './dto/auth-event-query.dto';
import { logger } from '@/util/logger';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userRolesService: UserRolesService,
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
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

  // Device management endpoints
  @Get('devices')
  @Roles(UserRole.ADMIN)
  async getAllDevices(@Query() query: DeviceQueryDto) {
    logger.info('Admin fetching devices', { query }, 'AdminController');
    
    const devices = await this.deviceService.findAll();
    
    logger.info('Admin devices list retrieved', { count: devices.length }, 'AdminController');
    return devices;
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
}