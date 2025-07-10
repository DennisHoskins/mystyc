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
  SchedulePerformanceStats,
  ScheduleHistoryStats
} from '@/common/interfaces/admin/stats/adminScheduleExecutionStats.interface';
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

  /**
   * Gets current execution statistics for a specific schedule
   * @param id - Schedule ID
   * @param query - Optional query parameters for date filtering
   * @returns Promise<SchedulePerformanceStats> - Schedule-specific performance data
   */
  @Get('schedules/:id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleStats(
    @Param('id') id: string,
    @Query() query: AdminStatsQueryDto
  ): Promise<SchedulePerformanceStats> {
    logger.info('Admin fetching schedule execution stats', {
      scheduleId: id,
      query
    }, 'AdminScheduleExecutionStatsController');

    try {
      // Verify schedule exists
      const schedule = await this.scheduleService.findById(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const stats = await this.adminScheduleExecutionStatsService.getScheduleStats(id, query);

      logger.info('Schedule execution stats retrieved', {
        scheduleId: id,
        totalExecutions: stats.executions.total,
        successRate: stats.executions.successRate,
        eventType: stats.eventType
      }, 'AdminScheduleExecutionStatsController');

      return stats;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      logger.error('Failed to fetch schedule execution stats', {
        scheduleId: id,
        error: error.message,
        query
      }, 'AdminScheduleExecutionStatsController');
      throw error;
    }
  }

  /**
   * Gets historical performance data for a specific schedule
   * @param id - Schedule ID
   * @param query - Query parameters including date range and period
   * @returns Promise<ScheduleHistoryStats> - Time-series performance data
   */
  @Get('schedules/:id/history')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getScheduleHistory(
    @Param('id') id: string,
    @Query() query: AdminStatsQueryDto
  ): Promise<ScheduleHistoryStats> {
    logger.info('Admin fetching schedule execution history', {
      scheduleId: id,
      query
    }, 'AdminScheduleExecutionStatsController');

    try {
      // Verify schedule exists
      const schedule = await this.scheduleService.findById(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const history = await this.adminScheduleExecutionStatsService.getScheduleHistory(id, query);

      logger.info('Schedule execution history retrieved', {
        scheduleId: id,
        daysAnalyzed: history.dailyPerformance.length,
        executionTrend: history.trends.executionTrend,
        eventDeliveryTrend: history.trends.eventDeliveryTrend
      }, 'AdminScheduleExecutionStatsController');

      return history;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      logger.error('Failed to fetch schedule execution history', {
        scheduleId: id,
        error: error.message,
        query
      }, 'AdminScheduleExecutionStatsController');
      throw error;
    }
  }

  /**
   * Gets performance comparison between multiple schedules
   * @param query - Query parameters for filtering and comparison
   * @returns Promise<SchedulePerformanceStats[]> - Comparative performance data
   */
  @Get('compare')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async compareSchedules(@Query() query: AdminStatsQueryDto): Promise<SchedulePerformanceStats[]> {
    logger.info('Admin fetching schedule execution comparison', {
      query
    }, 'AdminScheduleExecutionStatsController');

    try {
      // Get all schedules and their stats
      const schedules = await this.scheduleService.findAll({ limit: 100 });
      
      const comparisons = await Promise.all(
        schedules.map(schedule => 
          this.adminScheduleExecutionStatsService.getScheduleStats(schedule._id, query)
        )
      );

      // Sort by success rate descending
      const sortedComparisons = comparisons.sort((a, b) => b.executions.successRate - a.executions.successRate);

      logger.info('Schedule execution comparison retrieved', {
        schedulesCompared: sortedComparisons.length,
        topPerformer: sortedComparisons[0]?.scheduleId,
        topSuccessRate: sortedComparisons[0]?.executions.successRate
      }, 'AdminScheduleExecutionStatsController');

      return sortedComparisons;
    } catch (error) {
      logger.error('Failed to fetch schedule execution comparison', {
        error: error.message,
        query
      }, 'AdminScheduleExecutionStatsController');
      throw error;
    }
  }

  /**
   * Gets execution failure analysis for debugging
   * @param query - Query parameters for date filtering
   * @returns Promise<{failuresBySchedule: Array, commonErrors: Array}> - Failure analysis data
   */
  @Get('failures')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFailureAnalysis(@Query() query: AdminStatsQueryDto): Promise<{
    failuresBySchedule: Array<{
      scheduleId: string;
      eventName: string;
      failures: number;
      failureRate: number;
      commonErrors: string[];
    }>;
    commonErrors: Array<{
      error: string;
      count: number;
      schedules: string[];
    }>;
  }> {
    logger.info('Admin fetching schedule execution failure analysis', {
      query
    }, 'AdminScheduleExecutionStatsController');

    try {
      // This would be implemented in the service
      // For now, return a placeholder structure
      const result = {
        failuresBySchedule: [],
        commonErrors: []
      };

      logger.info('Schedule execution failure analysis retrieved', {
        failuresAnalyzed: result.failuresBySchedule.length,
        commonErrorsFound: result.commonErrors.length
      }, 'AdminScheduleExecutionStatsController');

      return result;
    } catch (error) {
      logger.error('Failed to fetch schedule execution failure analysis', {
        error: error.message,
        query
      }, 'AdminScheduleExecutionStatsController');
      throw error;
    }
  }
}