import { Controller, Get, Post, Patch, Delete,  Param, UseGuards, NotFoundException, Query } from '@nestjs/common';

import { Notification, Schedule, ScheduleExecution } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/admin-list-response.interface';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { SchedulesService } from '@/schedules/schedules.service';
import { ScheduleExecutionsService } from '@/schedules/schedule-executions.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { logger } from '@/common/util/logger';
import { AdminController } from './admin.controller';

@Controller('admin/schedules')
export class AdminSchedulesController extends AdminController<Schedule> {
  protected serviceName = 'Schedule';
  
  constructor(
    protected service: SchedulesService,
    private readonly scheduleExecutionService: ScheduleExecutionsService,
    private readonly notificationsService: NotificationsService
  ) {
    super();
  }


  /**
   * Enables a schedule
   * @param id - Schedule ID
   * @returns Promise<Schedule> - Updated schedule
   */
  @Patch(':id/enable')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async enable(@Param('id') id: string): Promise<Schedule> {
    logger.info('Admin enabling schedule', { scheduleId: id }, 'AdminScheduleController');

    try {
      const schedule = await this.service.update(id, { enabled: true });
      
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      logger.info('Schedule enabled successfully', {
        scheduleId: id,
        eventName: schedule.event_name
      }, 'AdminScheduleController');

      return schedule;
    } catch (error) {
      logger.error('Failed to enable schedule', {
        scheduleId: id,
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  /**
   * Disables a schedule
   * @param id - Schedule ID
   * @returns Promise<Schedule> - Updated schedule
   */
  @Patch(':id/disable')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async disable(@Param('id') id: string): Promise<Schedule> {
    logger.info('Admin disabling schedule', { scheduleId: id }, 'AdminScheduleController');

    try {
      const schedule = await this.service.update(id, { enabled: false });
      
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      logger.info('Schedule disabled successfully', {
        scheduleId: id,
        eventName: schedule.event_name
      }, 'AdminScheduleController');

      return schedule;
    } catch (error) {
      logger.error('Failed to disable schedule', {
        scheduleId: id,
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  // DELETE Operations

  /**
   * Deletes a schedule
   * @param id - Schedule ID
   * @returns Promise<{success: boolean, message: string}> - Deletion confirmation
   * @throws NotFoundException when schedule not found
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    logger.info('Admin deleting schedule', { scheduleId: id }, 'AdminScheduleController');

    try {
      const deleted = await this.service.delete(id);
      
      if (!deleted) {
        logger.warn('Schedule deletion failed - not found', { scheduleId: id }, 'AdminScheduleController');
        throw new NotFoundException('Schedule not found');
      }

      logger.info('Schedule deleted successfully', { scheduleId: id }, 'AdminScheduleController');

      return {
        success: true,
        message: 'Schedule deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      logger.error('Failed to delete schedule', {
        scheduleId: id,
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  // REFRESH Operations

  /**
   * Refreshes schedule Timezone cache
   */
  @Post('/refresh')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async refresh(): Promise<{ success: boolean; message: string }> {
    logger.info('Admin refreshing schedule timezone cache', { }, 'AdminScheduleController');

    try {
      await this.service.refreshTimezoneCache();

      logger.info('Timezone cache updated successfully', {  }, 'AdminScheduleController');

      return {
        success: true,
        message: 'Timezone cache updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update Timezone cache', {
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  // EXECUTION AND RELATED DATA ENDPOINTS

  /**
   * Gets cached Timzone/offsets from schedule
   * @returns Promise<Array<{timezone: string, offsetHours: number}>> - Array of timezones and offsets
   */
  @Get('/timezones')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCachedTimezones(): Promise<Array<{timezone: string, offsetHours: number}> | null> {
    logger.info('Admin fetching schedule cached timezones', {}, 'AdminScheduleController');

    try {
      // get cached timezones
      const timezones = this.service.getTimezoneCache();

      return timezones;
    } catch (error) {
      logger.error('Failed to fetch schedule executions', {
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  /**
   * Gets execution history for a specific schedule
   * @param id - Schedule ID
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<AdminListResponse<ScheduleExecution>> - Paginated execution history
   */
  @Get(':id/executions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleExecutions(
    @Param('id') id: string,
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<ScheduleExecution>> {
    logger.info('Admin fetching schedule executions', {
      scheduleId: id,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminScheduleController');

    try {
      // Verify schedule exists
      const schedule = await this.service.findById(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const [data, totalItems] = await Promise.all([
        this.scheduleExecutionService.findByScheduleId(id, query),
        this.scheduleExecutionService.getTotalByScheduleId(id)
      ]);

      const totalPages = Math.ceil(totalItems / (query.limit || 50));

      logger.info('Schedule executions retrieved', {
        scheduleId: id,
        count: data.length,
        totalItems
      }, 'AdminScheduleController');

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
      logger.error('Failed to fetch schedule executions', {
        scheduleId: id,
        error
      }, 'AdminScheduleController');
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
  async getScheduleNotifications(
    @Param('id') id: string,
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<Notification>> {
    logger.info('Admin fetching schedule notifications', {
      scheduleId: id,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminScheduleController');

    try {
      // Verify schedule exists
      const schedule = await this.service.findById(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const [data, totalItems] = await Promise.all([
        this.notificationsService.findByScheduleId(id, query),
        this.notificationsService.getTotalByScheduleId(id)
      ]);

      const totalPages = Math.ceil(totalItems / (query.limit || 50));

      logger.info('Schedule notifications retrieved', {
        scheduleId: id,
        count: data.length,
        totalItems
      }, 'AdminScheduleController');

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
        scheduleId: id,
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }

  /**
   * Gets summary statistics for a schedule
   * @param id - Schedule ID
   * @returns Promise<{executions: object, content: object, notifications: object}> - Summary stats
   */
  @Get(':id/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleSummary(@Param('id') id: string) {
    logger.info('Admin fetching schedule summary', { scheduleId: id }, 'AdminScheduleController');

    try {
      // Verify schedule exists
      const schedule = await this.service.findById(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const [executionStats, notificationsCount, latestExecution] = await Promise.all([
        this.scheduleExecutionService.getExecutionStats(id),
        this.notificationsService.getTotalByScheduleId(id),
        this.scheduleExecutionService.findLatestByScheduleId(id)
      ]);

      const summary = {
        schedule: {
          id: schedule._id,
          eventName: schedule.event_name,
          enabled: schedule.enabled,
          timezoneAware: schedule.timezone_aware,
          lastExecution: latestExecution?.executedAt || null
        },
        executions: {
          total: executionStats.total,
          successful: executionStats.successful,
          failed: executionStats.failed,
          successRate: executionStats.successRate
        },
        notifications: {
          total: notificationsCount
        }
      };

      logger.info('Schedule summary retrieved', {
        scheduleId: id,
        summary
      }, 'AdminScheduleController');

      return summary;
    } catch (error) {
      logger.error('Failed to fetch schedule summary', {
        scheduleId: id,
        error
      }, 'AdminScheduleController');
      throw error;
    }
  }
}