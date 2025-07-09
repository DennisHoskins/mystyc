import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleService } from '@/schedule/schedule.service';
import { ScheduleDocument } from '@/schedule/schemas/schedule.schema';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 
import { logger } from '@/common/util/logger';

export interface ScheduleSummaryStats {
  totalSchedules: number;
  enabledSchedules: number;
  disabledSchedules: number;
  timezoneAwareSchedules: number;
  globalSchedules: number;
  schedulesByEventName: Array<{
    eventName: string;
    count: number;
    enabled: number;
    disabled: number;
  }>;
}

export interface SchedulePerformanceStats {
  totalSchedules: number;
  executionStats: Array<{
    eventName: string;
    timezoneAware: boolean;
    scheduledTime: string; // "HH:MM" format
    enabled: boolean;
    lastUpdated: Date;
  }>;
  upcomingExecutions: Array<{
    eventName: string;
    scheduledTime: string;
    nextExecution: Date;
    timezoneAware: boolean;
  }>;
}

export interface ScheduleFailureStats {
  // Note: We don't currently track execution failures in the schedule collection
  // This would require a separate execution log collection in the future
  totalSchedules: number;
  monitoringNote: string;
}

export interface ScheduleStats {
  summary: ScheduleSummaryStats;
  performance: SchedulePerformanceStats;
  failures: ScheduleFailureStats;
}

@Injectable()
export class AdminScheduleStatsService {
  constructor(
    @InjectModel('Schedule') private scheduleModel: Model<ScheduleDocument>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async getSummaryStats(query?: AdminStatsQueryDto): Promise<ScheduleSummaryStats> {
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
            },
            eventNames: { $addToSet: '$event_name' }
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
        { $sort: { count: -1 } }
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
        error: error.message
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  async getPerformanceStats(query?: AdminStatsQueryDto): Promise<SchedulePerformanceStats> {
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
      const now = new Date();
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
        error: error.message
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  async getFailureStats(query?: AdminStatsQueryDto): Promise<ScheduleFailureStats> {
    logger.info('Generating schedule failure stats', { query }, 'AdminScheduleStatsService');
    
    try {
      const totalSchedules = await this.scheduleModel.countDocuments();

      // Note: Currently we don't track execution failures in a separate collection
      // This is a placeholder for future enhancement
      return {
        totalSchedules,
        monitoringNote: 'Schedule execution failures are currently logged but not tracked in database. Consider implementing execution log collection for detailed failure analysis.'
      };

    } catch (error) {
      logger.error('Failed to generate schedule failure stats', {
        error: error.message
      }, 'AdminScheduleStatsService');
      throw error;
    }
  }

  async getStats(query?: AdminStatsQueryDto): Promise<ScheduleStats> {
    logger.info('Generating comprehensive schedule stats', { query }, 'AdminScheduleStatsService');
    
    try {
      const [summary, performance, failures] = await Promise.all([
        this.getSummaryStats(query),
        this.getPerformanceStats(query),
        this.getFailureStats(query)
      ]);

      return {
        summary,
        performance,
        failures
      };

    } catch (error) {
      logger.error('Failed to generate comprehensive schedule stats', {
        error: error.message
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