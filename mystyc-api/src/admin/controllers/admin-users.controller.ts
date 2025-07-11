import { Controller, Query, Get, Post, Patch, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { Device } from '@/common/interfaces/device.interface';
import { AuthEvent } from '@/common/interfaces/auth-event.interface';
import { Notification } from '@/common/interfaces/notification.interface';
import { AdminController } from './admin.controller';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/admin/admin-list-response.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/users')
export class AdminUsersController extends AdminController<UserProfile> {
  protected serviceName = 'Users';

  constructor(
    protected service: UserProfilesService,
    private readonly deviceService: DevicesService,
    private readonly authEventsService: AuthEventsService,
    private readonly notificationsService: NotificationsService,
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

  @Get(':firebaseUid/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserSummary(@Param('firebaseUid') firebaseUid: string) {
    const [authEventsCount, notificationsCount] = await Promise.all([
      this.authEventsService.getTotalByFirebaseUid(firebaseUid),
      this.notificationsService.getTotalByFirebaseUid(firebaseUid)
    ]);

    return {
      authEvents: { total: authEventsCount },
      notifications: { total: notificationsCount },
    };
  }

  /**
   * Finds all devices registered to a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Device>> - Paginated list of user's devices
   */
  @Get(':firebaseUid/devices')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserDevices(
    @Param('firebaseUid') firebaseUid: string,
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Device>> {
    logger.info('Admin fetching user devices', { 
      firebaseUid,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserController');
    
    const [data, totalItems] = await Promise.all([
      this.deviceService.findByFirebaseUid(firebaseUid, query),
      this.deviceService.getTotalByFirebaseUid(firebaseUid)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User devices retrieved', { 
      firebaseUid, 
      count: data.length,
      totalItems
    }, 'AdminUserController');
    
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
   * Finds all auth events for a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<AuthEvent>> - Paginated list of user's auth events
   */
  @Get(':firebaseUid/auth-events')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserAuthEvents(
    @Param('firebaseUid') firebaseUid: string,
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<AuthEvent>> {
    logger.info('Admin fetching user auth events', { 
      firebaseUid,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserController');
    
    const [data, totalItems] = await Promise.all([
      this.authEventsService.findByFirebaseUid(firebaseUid, query),
      this.authEventsService.getTotalByFirebaseUid(firebaseUid)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User auth events retrieved', { 
      firebaseUid, 
      count: data.length,
      totalItems
    }, 'AdminUserController');
    
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
   * Finds all notifications for a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Notification>> - Paginated list of user's notifications
   */
  @Get(':firebaseUid/notifications')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserNotifications(
    @Param('firebaseUid') firebaseUid: string,
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Notification>> {
    logger.info('Admin fetching user notifications', { 
      firebaseUid,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserController');
    
    const [data, totalItems] = await Promise.all([
      this.notificationsService.findByFirebaseUid(firebaseUid, query),
      this.notificationsService.getTotalByFirebaseUid(firebaseUid)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User notifications retrieved', { 
      firebaseUid, 
      count: data.length,
      totalItems
    }, 'AdminUserController');
    
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