import { Controller, Get, Param, UseGuards, NotFoundException, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { ScheduleExecutionService } from '@/schedule/schedule-execution.service';
import { ContentService } from '@/content/content.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { ScheduleExecution } from '@/common/interfaces/scheduleExecution.interface';
import { Content } from '@/common/interfaces/content.interface';
import { Notification } from '@/common/interfaces/notification.interface';
import { AdminController } from './admin.controller';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/admin/adminListResponse.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/schedule-executions')
export class AdminScheduleExecutionController extends AdminController<ScheduleExecution> {
  protected serviceName = 'ScheduleExecution';
  
  constructor(
    protected service: ScheduleExecutionService,
    protected contentService: ContentService,
    protected notificationsService: NotificationsService
  ) {
    super();
  }

  /**
   * Gets content created by a specific schedule
   * @param id - Schedule ID
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<AdminListResponse<Content>> - Paginated content list
   */
  @Get(':id/content')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleContent(
    @Param('id') id: string,
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching schedule content', {
      executionId: id,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminScheduleExecutionController');

    try {
      // Verify schedule exists
      const scheduleExecution = await this.service.findById(id);
      if (!scheduleExecution) {
        throw new NotFoundException('Schedule execution not found');
      }

      const [data, totalItems] = await Promise.all([
        this.contentService.findByExecutionId(id, query),
        this.contentService.getTotalByExecutionId(id)
      ]);

      const totalPages = Math.ceil(totalItems / (query.limit || 50));

      logger.info('Schedule execution content retrieved', {
        executionId: id,
        count: data.length,
        totalItems
      }, 'AdminScheduleExecutionController');

      return {
        data,
        pagination: {
          limit: query.limit || 50,
          offset: query.offset || 0,
          hasMore: data.length === (query.limit || 50),
          totalItems,
          totalPages
        },
        sort: query.sortBy ? {
          field: query.sortBy,
          order: query.sortOrder || 'desc'
        } : undefined
      };
    } catch (error) {
      logger.error('Failed to fetch schedule execution content', {
        executionId: id,
        error: error.message
      }, 'AdminScheduleExecutionController');
      throw error;
    }
  }

  /**
   * Gets notifications sent by a specific schedule
   * @param id - Schedule ID
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<AdminListResponse<Notification>> - Paginated notifications list
   */
  @Get(':id/notifications')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleExecutionNotifications(
    @Param('id') id: string,
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Notification>> {
    logger.info('Admin fetching schedule notifications', {
      executionId: id,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminScheduleExecutionController');

    try {
      // Verify schedule execution exists
      const scheduleExecution = await this.service.findById(id);
      if (!scheduleExecution) {
        throw new NotFoundException('Schedule execution not found');
      }

      const [data, totalItems] = await Promise.all([
        this.notificationsService.findByExecutionId(id, query),
        this.notificationsService.getTotalByExecutionId(id)
      ]);

      const totalPages = Math.ceil(totalItems / (query.limit || 50));

      logger.info('Schedule execution notifications retrieved', {
        executionId: id,
        count: data.length,
        totalItems
      }, 'AdminScheduleExecutionController');

      return {
        data,
        pagination: {
          limit: query.limit || 50,
          offset: query.offset || 0,
          hasMore: data.length === (query.limit || 50),
          totalItems,
          totalPages
        },
        sort: query.sortBy ? {
          field: query.sortBy,
          order: query.sortOrder || 'desc'
        } : undefined
      };
    } catch (error) {
      logger.error('Failed to fetch schedule notifications', {
        executionId: id,
        error: error.message
      }, 'AdminScheduleExecutionController');
      throw error;
    }
  }
  
}