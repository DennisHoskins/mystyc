import { Controller, Query, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { AuthEvent, Device, Notification, PaymentHistory, UserProfile } from 'mystyc-common/schemas/';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants';
import { UsersSummary } from 'mystyc-common/admin/interfaces/summary';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { isErrorWithStatus } from '@/common/util/error';
import { UserProfilesService } from '@/users/user-profiles.service';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { PaymentHistoryService } from '@/payments/payment-history.service';
import { logger } from '@/common/util/logger';
import { AdminController } from './admin.controller';

@Controller('admin/users')
export class AdminUsersController extends AdminController<UserProfile> {
  protected serviceName = 'Users';

  constructor(
    protected service: UserProfilesService,
    private readonly deviceService: DevicesService,
    private readonly authEventsService: AuthEventsService,
    private readonly notificationsService: NotificationsService,
    private readonly paymentHistoryService: PaymentHistoryService,
  ) {
    super();
  }

  // GET Methods (Read Operations)

  /**
   * Finds all users
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<UserProfile>> - Paginated list of user profiles
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: BaseAdminQuery): Promise<AdminListResponse<UserProfile>> {
    return super.findAll(query);
  }

  /**
   * Gets summary statistics for users
   * @returns Promise<{}> - Users stats
   */
  @Get('/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsersSummary(@Param('firebaseUid') firebaseUid: string): Promise<UsersSummary> {
    const [totalCount, usersCount, plusCount] = await Promise.all([
      this.service.getTotal(),
      this.service.getTotalBySubscriptionTier(SubscriptionLevel.USER),
      this.service.getTotalBySubscriptionTier(SubscriptionLevel.PLUS),
    ]);

    return {
      total: totalCount,
      users: usersCount,
      plus: plusCount
    };
  }

  /**
   * Finds all unsubscribed users
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<UserProfile>> - Paginated list of user profiles
   */
  @Get("/user")
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsers(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<UserProfile>> {
    logger.info('Admin fetching user content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUsersController');
    
    const [data, totalItems] = await Promise.all([

      this.service.findBySubscriptionTier(SubscriptionLevel.USER, query),
      this.service.getTotalBySubscriptionTier(SubscriptionLevel.USER)

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminUsersController');
    
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
   * Finds all users subscribed to mystyc plus
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<UserProfile>> - Paginated list of user profiles
   */
  @Get("/plus")
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlusUsers(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<UserProfile>> {
    logger.info('Admin fetching user plus content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUsersController');
    
    const [data, totalItems] = await Promise.all([

      this.service.findBySubscriptionTier(SubscriptionLevel.PLUS, query),
      this.service.getTotalBySubscriptionTier(SubscriptionLevel.PLUS)

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('UserPlus content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminUsersController');
    
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
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get user', {
        firebaseUid,
        error
      }, 'AdminUserController');
      
      throw error;
    }
  }

  /**
   * Gets summary statistics for a user
   * @param id - firebaseUid
   * @returns Promise<{}> - User stats
   */
  @Get(':firebaseUid/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserSummary(@Param('firebaseUid') firebaseUid: string) {
    const [deviceCount, authEventsCount, notificationsCount, paymentsCount] = await Promise.all([
      this.deviceService.getTotalByFirebaseUid(firebaseUid),
      this.authEventsService.getTotalByFirebaseUid(firebaseUid),
      this.notificationsService.getTotalByFirebaseUid(firebaseUid),
      this.paymentHistoryService.getTotalByFirebaseUid(firebaseUid)
    ]);

    return {
      devices: deviceCount,
      authEvents: authEventsCount,
      notifications: notificationsCount,
      payments: paymentsCount,
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
    @Query() query: BaseAdminQuery
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
    @Query() query: BaseAdminQuery
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
    @Query() query: BaseAdminQuery
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

  /**
   * Finds all payments for a specific user (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Notification>> - Paginated list of user's payments
   */
  @Get(':firebaseUid/payments')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserPayments(
    @Param('firebaseUid') firebaseUid: string,
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<PaymentHistory>> {
    logger.info('Admin fetching user payments', { 
      firebaseUid,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserController');
    
    const [data, totalItems] = await Promise.all([
      this.paymentHistoryService.findByFirebaseUid(firebaseUid, query),
      this.paymentHistoryService.getTotalByFirebaseUid(firebaseUid)
    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User payments retrieved', { 
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