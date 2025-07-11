import { Controller, Query, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AdminScheduleExecutionStatsService } from '@/admin/services/admin-schedule-execution-stats.service';
import { ScheduleService } from '@/schedule/schedule.service';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto';
import { 
  ScheduleExecutionStats,
} from '@/common/interfaces/admin/stats/admin-schedule-execution-stats.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/stats/schedule-executions')
export class AdminScheduleExecutionStatsController {
  constructor(
    private readonly adminScheduleExecutionStatsService: AdminScheduleExecutionStatsService,
    private readonly scheduleService: ScheduleService,
  ) {}

  /**
   * Gets overall schedule execution statistics across all schedules
   * @param query - Query parameters for date filtering
   * @returns Promise<ScheduleExecutionStats> - System-wide schedule performance data
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getOverallStats(@Query() query: AdminStatsQueryDto): Promise<ScheduleExecutionStats> {
    logger.info('Admin fetching overall schedule execution stats', {
      query
    }, 'AdminScheduleExecutionStatsController');

    try {
      const stats = await this.adminScheduleExecutionStatsService.getOverallScheduleStats(query);

      logger.info('Overall schedule execution stats retrieved', {
        totalExecutions: stats.systemOverview.totalExecutions,
        successRate: stats.systemOverview.successRate
      }, 'AdminScheduleExecutionStatsController');

      return stats;
    } catch (error) {
      logger.error('Failed to fetch overall schedule execution stats', {
        error: error.message,
        query
      }, 'AdminScheduleExecutionStatsController');
      throw error;
    }
  }
}