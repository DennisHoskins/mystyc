import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { UserProfileService } from '@/users/user-profile.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { Device } from '@/common/interfaces/device.interface';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { AdminController } from './admin.controller';
import { AdminListResponse } from '@/common/interfaces/adminQuery.interface';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Controller('admin/device')
export class AdminDeviceController extends AdminController<Device> {
  protected serviceName = 'Device';

  constructor(
    protected service: DeviceService,
    private readonly userProfilesService: UserProfileService,
    private readonly authEventService: AuthEventService,
    private readonly notificationsService: NotificationsService
  ) {
    super();
  }

  // GET Methods (Read Operations)

  @Get(':firebaseUid/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceSummary(@Param('deviceId') deviceId: string) {
    const [authEventsCount, notificationsCount] = await Promise.all([
      this.authEventService.getTotalByDeviceId(deviceId),
      this.notificationsService.getTotalByDeviceId(deviceId)
    ]);

    return {
      authEvents: { total: authEventsCount },
      notifications: { total: notificationsCount },
    };
  }
  

  /**
   * Finds all users for a specific device with pagination (admin use)
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<UserProfile[]> - Array of device's users, newest first
   */
  @Get(':deviceId/users')  // Fixed the typo - removed extra 's'
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceUsers(
  @Param('deviceId') deviceId: string,
  @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<UserProfile>> {
  logger.info('Admin fetching device users', { 
    deviceId,
    limit: query.limit,
    offset: query.offset,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder
  }, 'AdminDeviceController');
  
  const [firebaseUids, totalItems] = await Promise.all([
    this.service.getFirebaseUidsByDeviceId(deviceId),
    this.service.getTotalUsersByDeviceId(deviceId)
  ]);

  const data = await this.userProfilesService.findByFirebaseUids(firebaseUids, query);
  
  const totalPages = Math.ceil(totalItems / (query.limit || 100));
  
  logger.info('Device users retrieved', { 
    deviceId, 
    count: data.length,
    totalItems
  }, 'AdminDeviceController');
  
  return {
    data,
    pagination: {
      limit: query.limit || 100,
      offset: query.offset || 0,
      hasMore: data.length === (query.limit || 100),
      totalItems,
      totalPages
    },
    sort: query.sortBy ? {
      field: query.sortBy,
      order: query.sortOrder || 'desc'
    } : undefined
  };
  }

  /**
   * Finds all auth events for a specific device with pagination (admin use)
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<AuthEvent[]> - Array of device's auth events, newest first
   */
  @Get(':deviceId/auth-events')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceAuthEvents(
    @Param('deviceId') deviceId: string,
    @Query() query: BaseAdminQueryDto
  ) {
    logger.info('Admin fetching device auth events', { 
      deviceId,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminDeviceController');
    
    const [data, totalItems] = await Promise.all([
      this.authEventService.findByDeviceId(deviceId, query),
      this.authEventService.getTotalByDeviceId(deviceId)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('Device auth events retrieved', { 
      deviceId, 
      count: data.length,
      totalItems
    }, 'AdminDeviceController');
    
    return {
      data,
      pagination: {
        limit: query.limit || 100,
        offset: query.offset || 0,
        hasMore: data.length === (query.limit || 100),
        totalItems,
        totalPages
      },
      sort: query.sortBy ? {
        field: query.sortBy,
        order: query.sortOrder || 'desc'
      } : undefined
    };
  }

  /**
   * Finds all notifications for a specific device with pagination (admin use)
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<AuthEvent[]> - Array of device's notifications, newest first
   */
  @Get(':deviceId/notifications')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceNotifications(
    @Param('deviceId') deviceId: string,
     @Query() query: BaseAdminQueryDto
 ) {
    logger.info('Admin fetching device notifications', { 
      deviceId,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminDeviceController');
    
    const [data, totalItems] = await Promise.all([
      this.notificationsService.findByDeviceId(deviceId, query),
      this.notificationsService.getTotalByDeviceId(deviceId)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('Device notifications retrieved', { 
      deviceId, 
      count: data.length,
      totalItems
    }, 'AdminDeviceController');
    
    return {
      data,
      pagination: {
        limit: query.limit || 100,
        offset: query.offset || 0,
        hasMore: data.length === (query.limit || 100),
        totalItems,
        totalPages
      },
      sort: query.sortBy ? {
        field: query.sortBy,
        order: query.sortOrder || 'desc'
      } : undefined
    };
  }
}