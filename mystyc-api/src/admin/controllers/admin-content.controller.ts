import { Controller, Get, UseGuards, Query } from '@nestjs/common';

import { Content } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/admin-list-response.interface';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { ContentService } from '@/content/content.service';
import { NotificationContentService } from '@/content/notification-content.service';
import { WebsiteContentService } from '@/content/website-content.service';
import { UserContentService } from '@/content/user-content.service';
import { UserPlusContentService } from '@/content/user-plus-content.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { AdminController } from './admin.controller';

@Controller('admin/content')
export class AdminContentController extends AdminController<Content> {
  protected serviceName = 'Content';
  
  constructor(
    protected service: ContentService,
    private readonly notificationContentService: NotificationContentService,
    private readonly websiteContentService: WebsiteContentService,
    private readonly userContentService: UserContentService,
    private readonly userPlusContentService: UserPlusContentService,
    private readonly userProfilesService: UserProfilesService,
  ) {
    super();
  }

  /**
   * Returns totals of content types
   * @returns Promise<ContentSummary> - content totals by type
   */
  @Get('summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getContentSummary() {
    const [contentCount, websiteCount, notificationsCount, usersCount, plusCount] = await Promise.all([
      this.service.getTotal(),
      this.websiteContentService.getTotal(),
      this.notificationContentService.getTotal(),
      this.userContentService.getTotal(),
      this.userPlusContentService.getTotal(),
    ]);

    return {
      total: contentCount,
      website: websiteCount,
      notifications: notificationsCount,
      users: usersCount,
      plus: plusCount,
    };
  }

  /**
   * Finds all notification content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of notification content
   */
  @Get('content-notifications')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationsContent(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching notification content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminContentController');
    
    const [data, totalItems] = await Promise.all([

      this.notificationContentService.findAll(query),
      this.notificationContentService.getTotal()

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('Notification content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminContentController');
    
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
   * Finds all user content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of user content
   */
  @Get('content-users')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserContent(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching user content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminContentController');
    
    const [data, totalItems] = await Promise.all([

      this.userContentService.findAll(query),
      this.userContentService.getTotal()

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminContentController');
    
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
   * Finds all user plus content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of user plus content
   */
  @Get('content-users-plus')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserPlusContent(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching user plus content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminContentController');
    
    const [data, totalItems] = await Promise.all([

      this.userPlusContentService.findAll(query),
      this.userPlusContentService.getTotal()

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User plus content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminContentController');
    
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