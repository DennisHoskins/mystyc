import { Controller, Get, Post, UseGuards, Param, Query, Body, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { ContentService } from '@/content/content.service';
import { NotificationContentService } from '@/content/notification-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { AdminController } from './admin.controller';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/admin/admin-list-response.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/content-notifications')
export class AdminNotificationsContentController extends AdminController<Content> {
  protected serviceName = 'AdminNotificationsContent';
  
  constructor(
    protected service: ContentService,
    private readonly notificationContentService: NotificationContentService,
  ) {
    super();
  }

  /**
   * Finds all notification content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of notification content
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationsContent(
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching notification content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminContentNotificationsController');
    
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
}