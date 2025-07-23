import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  ScheduleSummaryStats,
  SchedulePerformanceStats,
  ScheduleFailureStats
} from 'mystyc-common/admin/interfaces/stats/admin-schedule-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SchedulesService } from '@/schedules/schedules.service';
import { ScheduleDocument } from '@/schedules/schemas/schedule.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'Schedules',
  service: AdminSchedulesStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' },
    { key: 'performance', method: 'getPerformanceStats' },
    { key: 'failures', method: 'getFailureStats' }
  ]
})
@Injectable()
export class AdminSchedulesStatsService {
  constructor(
    @InjectModel('Schedule') private scheduleModel: Model<ScheduleDocument>,
    private readonly scheduleService: SchedulesService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<ScheduleSummaryStats> {
    logger.info('Generating schedule summary stats', { query }, 'AdminScheduleStatsService');
    
    try {
      const pipeline: any[] = [
        {
          $group: {
            _id: null,
            totalSchedules: { $sum: 1 },
            enabledSchedules: {
              $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
            },
            disabledSchedules: {
              $sum: { $cond: [{ $eq: ['$enabled', false] }, 1, 0] }
            },
            timezoneAwareSchedules: {
              $sum: { $cond: [{ $eq: ['$timezone_aware', true] }, 1, 0] }
            },
            globalSchedules: {
              $sum: { $cond: [{ $eq: ['$timezone_aware', false] }, 1, 0] }
            }
          }
        }
      ];

      const [summaryResult] = await this.scheduleModel.aggregate(pipeline);

      // Get breakdown by event name
      const eventNamePipeline: any[] = [
        {
          $group: {
            _id: '$event_name',
            count: { $sum: 1 },
            enabled: {
              $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
            },
            disabled: {
              $sum: { $cond: [{ $eq: ['$enabled', false] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            eventName: '$_id',
            count: 1,
            enabled: 1,
            disabled: 1,
            _id: 0
          }
        },
        { $sort: { count: -1 as -1 } }
      ];

      const eventNameResults = await this.scheduleModel.aggregate(eventNamePipeline);

      if (!summaryResult) {
        return {
          totalSchedules: 0,
          enabledSchedules: 0,
          disabledSchedules: 0,
          timezoneAwareSchedules: 0,
          globalSchedules: 0,
          schedulesByEventName: []
        };
      }

      logger.info('Schedule summary stats generated', {
        totalSchedules: summaryResult.totalSchedules,
        enabled: summaryResult.enabledSchedules
      }, 'AdminScheduleStatsService');

      return {
        totalSchedules: summaryResult.totalSchedules,
        enabledSchedules: summaryResult.enabledSchedules,
        disabledSchedules: summaryResult.disabledSchedules,
        timezoneAwareSchedules: summaryResult.timezoneAwareSchedules,
        globalSchedules: summaryResult.globalSchedules,
        schedulesByEventName: eventNameResults
      };

    } catch (error) {
      logger.error('Failed to generate schedule summary stats', {
        error
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  async getPerformanceStats(query?: AdminStatsQuery): Promise<SchedulePerformanceStats> {
    logger.info('Generating schedule performance stats', { query }, 'AdminScheduleStatsService');
    
    try {
      const schedules = await this.scheduleModel
        .find({})
        .sort({ 'time.hour': 1, 'time.minute': 1 })
        .exec();

      const executionStats = schedules.map(schedule => ({
        eventName: schedule.event_name,
        timezoneAware: schedule.timezone_aware,
        scheduledTime: `${String(schedule.time.hour).padStart(2, '0')}:${String(schedule.time.minute).padStart(2, '0')}`,
        enabled: schedule.enabled,
        lastUpdated: schedule.updatedAt
      }));

      // Calculate upcoming executions (next 24 hours)
      const upcomingExecutions = schedules
        .filter(schedule => schedule.enabled)
        .map(schedule => {
          const nextExecution = this.calculateNextExecution(schedule.time.hour, schedule.time.minute);
          return {
            eventName: schedule.event_name,
            scheduledTime: `${String(schedule.time.hour).padStart(2, '0')}:${String(schedule.time.minute).padStart(2, '0')}`,
            nextExecution,
            timezoneAware: schedule.timezone_aware
          };
        })
        .sort((a, b) => a.nextExecution.getTime() - b.nextExecution.getTime())
        .slice(0, 10); // Next 10 executions

      logger.info('Schedule performance stats generated', {
        totalSchedules: schedules.length,
        upcomingExecutions: upcomingExecutions.length
      }, 'AdminScheduleStatsService');

      return {
        totalSchedules: schedules.length,
        executionStats,
        upcomingExecutions
      };

    } catch (error) {
      logger.error('Failed to generate schedule performance stats', {
        error
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  async getFailureStats(query?: AdminStatsQuery): Promise<ScheduleFailureStats> {
    logger.info('Generating schedule failure stats', { query }, 'AdminScheduleStatsService');
    
    try {
      const totalSchedules = await this.scheduleModel.countDocuments();

      return {
        totalSchedules,
        monitoringNote: 'Schedule execution tracking is now available via AdminScheduleExecutionStatsService. This service provides basic schedule configuration data.'
      };

    } catch (error) {
      logger.error('Failed to generate schedule failure stats', {
        error
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  /**
   * Calculate the next execution time for a given hour/minute
   */
  private calculateNextExecution(hour: number, minute: number): Date {
    const now = new Date();
    const nextExecution = new Date();
    
    nextExecution.setHours(hour, minute, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }
    
    return nextExecution;
  }
}