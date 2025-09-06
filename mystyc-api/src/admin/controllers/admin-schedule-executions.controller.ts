import { Controller, Get, Param, UseGuards, NotFoundException, Query } from '@nestjs/common';

import { Notification, ScheduleExecution } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/admin-list-response.interface';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { ScheduleExecutionsService } from '@/schedules/schedule-executions.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { AdminController } from './admin.controller';

@Controller('admin/schedule-executions')
export class AdminScheduleExecutionsController extends AdminController<ScheduleExecution> {
  protected serviceName = 'ScheduleExecution';
  
  constructor(
    protected service: ScheduleExecutionsService,
    protected notificationsService: NotificationsService
  ) {
    super();
  }

  @Get(':executionId/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleExecutionSummary(@Param('executionId') executionId: string) {
    const [notificationsCount] = await Promise.all([
      this.notificationsService.getTotalByExecutionId(executionId)
    ]);

    return {
      notifications: { total: notificationsCount },
    };
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
    @Query() query: BaseAdminQuery
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
        error
      }, 'AdminScheduleExecutionController');
      throw error;
    }
  }
  
}