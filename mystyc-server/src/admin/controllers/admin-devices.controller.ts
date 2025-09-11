import { Controller, Get, UseGuards, Param, Query, NotFoundException } from '@nestjs/common';

import { Device, UserProfile } from 'mystyc-common/schemas/';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { DevicesSummary } from 'mystyc-common/admin/interfaces/summary';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/admin-list-response.interface';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { AdminController } from './admin.controller';

@Controller('admin/devices')
export class AdminDevicesController extends AdminController<Device> {
  protected serviceName = 'Device';

  constructor(
    protected service: DevicesService,
    private readonly userProfilesService: UserProfilesService,
    private readonly authEventService: AuthEventsService,
    private readonly notificationsService: NotificationsService
  ) {
    super();
  }

  // GET Methods (Read Operations)

  /**
   * Gets summary statistics for devices
   * @returns Promise<{}> - Devices stats
   */
  @Get('/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDevicesSummary(@Param('firebaseUid') firebaseUid: string): Promise<DevicesSummary> {
    const [totalCount, onlineCount, offlineCount] = await Promise.all([
      this.service.getTotal(),
      this.service.getTotalOnline(),
      this.service.getTotalOffline(),
    ]);

    return {
      total: totalCount,
      online: onlineCount,
      offline: offlineCount
    };
  }

  /**
   * Gets summary statistics for devices
   * @returns Promise<{}> - Devices stats
   */
  @Get('/online')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOnline(@Query() query: BaseAdminQuery): Promise<AdminListResponse<Device>> {
    logger.info(`Admin fetching ${this.serviceName} list`, { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, `Admin${this.serviceName}Controller`);

    const [data, totalItems] = await Promise.all([
      this.service.findByOnline(query),
      this.service.getTotalOnline()
    ])
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info(`Admin ${this.serviceName} list retrieved`, { 
      count: data.length 
    }, `Admin${this.serviceName}Controller`);

    logger.info("[AdminQuery]", query);

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
   * Gets summary statistics for devices
   * @returns Promise<{}> - Devices stats
   */
  @Get('/offline')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOffline(@Query() query: BaseAdminQuery): Promise<AdminListResponse<Device>> {
    logger.info(`Admin fetching ${this.serviceName} list`, { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, `Admin${this.serviceName}Controller`);

    const [data, totalItems] = await Promise.all([
      this.service.findByOffline(query),
      this.service.getTotalOffline()
    ])
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info(`Admin ${this.serviceName} list retrieved`, { 
      count: data.length 
    }, `Admin${this.serviceName}Controller`);

    logger.info("[AdminQuery]", query);

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
   * Get device by deviceId
   * @param id - Item identifier
   * @returns Promise<T> - Single item
   * @throws NotFoundException when item not found
   */
  @Get(':deviceId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findById(@Param('deviceId') deviceId: string): Promise<Device> {
    logger.info(`Admin fetching Device by ID`, { deviceId }, `AdminDeviceController`);

    const device = await this.service.findByDeviceId(deviceId);
    
    if (!device) {
      logger.warn(`Device not found`, { deviceId }, `AdminDeviceController`);
      throw new NotFoundException(`Device not found`);
    }

    logger.info(`Device retrieved successfully`, { deviceId }, `AdminDeviceController`);
    return device;
  }

  @Get(':deviceId/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceSummary(@Param('deviceId') deviceId: string) {
    const [usersCount, authEventsCount, notificationsCount] = await Promise.all([
      this.service.getTotalUsersByDeviceId(deviceId),
      this.authEventService.getTotalByDeviceId(deviceId),
      this.notificationsService.getTotalByDeviceId(deviceId)
    ]);

    return {
      users: usersCount,
      authEvents: authEventsCount,
      notifications: notificationsCount,
    };
  }

  /**
   * Finds all users for a specific device with pagination (admin use)
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<UserProfile[]> - Array of device's users, newest first
   */
  @Get(':deviceId/users')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeviceUsers(
  @Param('deviceId') deviceId: string,
  @Query() query: BaseAdminQuery
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
    @Query() query: BaseAdminQuery
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
     @Query() query: BaseAdminQuery
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