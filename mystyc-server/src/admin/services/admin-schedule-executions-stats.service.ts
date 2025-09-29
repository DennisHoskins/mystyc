import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  ScheduleExecutionStats,
  ScheduleExecutionPerformanceStats,
  ScheduleHistoryStats,
  ScheduleSystemOverviewStats,
  ScheduleEventTypeStats,
  ScheduleRecentExecutionStats,
  ScheduleExecutionSummaryStats
} from 'mystyc-common/admin/interfaces/stats/admin-schedule-execution-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SchedulesService } from '@/schedules/schedules.service';
import { ScheduleExecutionsService } from '@/schedules/schedule-executions.service';
import { ScheduleDocument } from '@/schedules/schemas/schedule.schema';
import { ScheduleExecutionDocument } from '@/schedules/schemas/schedule-execution.schema';
import { NotificationDocument } from '@/notifications/schemas/notification.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'ScheduleExecutions',
  service: AdminScheduleExecutionsStatsService,
  stats: [
    { key: 'systemOverview', method: 'getOverallStatistics' },
    { key: 'byEventType', method: 'getEventTypeStatistics' },
    { key: 'recentExecutions', method: 'getRecentExecutions' },
  ]
})
@Injectable()
export class AdminScheduleExecutionsStatsService {
  constructor(
    @InjectModel('Schedule') private scheduleModel: Model<ScheduleDocument>,
    @InjectModel('ScheduleExecution') private scheduleExecutionModel: Model<ScheduleExecutionDocument>,
    @InjectModel('Notification') private notificationModel: Model<NotificationDocument>,
    private readonly scheduleService: SchedulesService,
    private readonly scheduleExecutionService: ScheduleExecutionsService,
  ) {}

  /**
   * Gets comprehensive execution statistics for a specific schedule
   * @param scheduleId - Schedule ID to analyze
   * @param query - Optional query parameters for date filtering
   * @returns Promise<ScheduleExecutionPerformanceStats> - Detailed execution performance data
   */
  async getScheduleStats(scheduleId: string, query?: AdminStatsQuery): Promise<ScheduleExecutionPerformanceStats> {
    logger.info('Generating schedule execution stats', { scheduleId, query }, 'AdminScheduleExecutionStatsService');

    try {
      // Get basic schedule info
      const schedule = await this.scheduleService.findById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Build date filter
      const dateFilter = this.buildDateFilter(query);
      
      // Get execution statistics
      const executionStats = await this.getExecutionStatistics(scheduleId, dateFilter);
      
      // Get related content/notification statistics
      const eventData = await this.getEventDataStatistics(scheduleId, schedule.event_name, dateFilter);
      
      // Get latest execution
      const latestExecution = await this.scheduleExecutionService.findLatestByScheduleId(scheduleId);
      
      // Calculate average duration
      const avgDuration = await this.getAverageExecutionDuration(scheduleId, dateFilter);

      const result: ScheduleExecutionPerformanceStats = {
        scheduleId,
        eventName: schedule.event_name,
        eventType: this.determineEventType(schedule.event_name),
        executions: executionStats,
        lastExecuted: latestExecution?.executedAt,
        averageDuration: avgDuration,
        eventData
      };

      logger.info('Schedule execution stats generated', {
        scheduleId,
        totalExecutions: executionStats.total,
        successRate: executionStats.successRate
      }, 'AdminScheduleExecutionStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate schedule execution stats', {
        scheduleId,
        error
      }, 'AdminScheduleExecutionStatsService');
      throw error;
    }
  }

  /**
   * Gets historical performance data for a schedule over time
   * @param scheduleId - Schedule ID to analyze
   * @param query - Query parameters including date range and period
   * @returns Promise<ScheduleHistoryStats> - Time-series performance data
   */
  async getScheduleHistory(scheduleId: string, query: AdminStatsQuery): Promise<ScheduleHistoryStats> {
    logger.info('Generating schedule history stats', { scheduleId, query }, 'AdminScheduleExecutionStatsService');

    try {
      const schedule = await this.scheduleService.findById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const { startDate, endDate } = this.getDateRange(query);
      const eventType = this.determineEventType(schedule.event_name);

      // Get daily performance data
      const dailyPerformance = await this.getDailyPerformanceData(scheduleId, startDate, endDate, eventType);
      
      // Calculate trends
      const trends = this.calculateTrends(dailyPerformance);

      const result: ScheduleHistoryStats = {
        scheduleId,
        eventName: schedule.event_name,
        eventType,
        timeRange: { start: startDate, end: endDate },
        dailyPerformance,
        trends
      };

      logger.info('Schedule history stats generated', {
        scheduleId,
        daysAnalyzed: dailyPerformance.length,
        executionTrend: trends.executionTrend
      }, 'AdminScheduleExecutionStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate schedule history stats', {
        scheduleId,
        error
      }, 'AdminScheduleExecutionStatsService');
      throw error;
    }
  }

  /**
   * Gets overall schedule system statistics
   * @param query - Optional query parameters for filtering
   * @returns Promise<ScheduleExecutionStats> - System-wide schedule performance
   */
  async getOverallScheduleStats(query?: AdminStatsQuery): Promise<ScheduleExecutionStats> {
    logger.info('Generating overall schedule stats', { query }, 'AdminScheduleExecutionStatsService');

    try {
      // Overall system statistics
      const systemOverview = await this.getOverallStatistics(query);
      
      // Performance by event type
      const byEventType = await this.getEventTypeStatistics(query);
      
      // Recent executions
      const recentExecutions = await this.getRecentExecutions(query);

      const result: ScheduleExecutionStats = {
        systemOverview,
        byEventType,
        recentExecutions
      };

      logger.info('Overall schedule stats generated', {
        totalExecutions: systemOverview.totalExecutions,
        successRate: systemOverview.successRate
      }, 'AdminScheduleExecutionStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate overall schedule stats', {
        error
      }, 'AdminScheduleExecutionStatsService');
      throw error;
    }
  }

  // Private helper methods

  private async getExecutionStatistics(scheduleId: string, dateFilter: any): Promise<ScheduleExecutionSummaryStats> {
    const matchCondition: any = { scheduleId };
    if (dateFilter) {
      matchCondition.executedAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ];

    const [result] = await this.scheduleExecutionModel.aggregate(pipeline);
    
    if (!result) {
      return { total: 0, successful: 0, failed: 0, successRate: 0 };
    }

    const successRate = result.total > 0 ? Math.round((result.successful / result.total) * 100) : 0;

    return {
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      successRate
    };
  }

  private async getEventDataStatistics(scheduleId: string, eventName: string, dateFilter: any): Promise<{
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  }> {
    return this.getNotificationStatistics(scheduleId, dateFilter);
  }

  private async getNotificationStatistics(scheduleId: string, dateFilter: any): Promise<{
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  }> {
    const matchCondition: any = { scheduleId };
    if (dateFilter) {
      matchCondition.createdAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ];

    const [result] = await this.notificationModel.aggregate(pipeline);
    
    if (!result) {
      return { total: 0, sent: 0, failed: 0, successRate: 0 };
    }

    const successRate = result.total > 0 ? Math.round((result.sent / result.total) * 100) : 0;

    return {
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      successRate
    };
  }

  private async getAverageExecutionDuration(scheduleId: string, dateFilter: any): Promise<number> {
    const matchCondition: any = { 
      scheduleId,
      duration: { $exists: true, $ne: null }
    };
    if (dateFilter) {
      matchCondition.executedAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$duration' }
        }
      }
    ];

    const [result] = await this.scheduleExecutionModel.aggregate(pipeline);
    return result?.averageDuration ? Math.round(result.averageDuration) : 0;
  }

  private async getDailyPerformanceData(
    scheduleId: string,
    startDate: Date,
    endDate: Date,
    eventType: 'content' | 'notification'
  ): Promise<Array<{
    date: string;
    executionStatus: 'success' | 'failed' | 'not_run';
    eventSuccessRate?: number;
    totalEvents?: number;
  }>> {
    const dailyData: Array<{
      date: string;
      executionStatus: 'success' | 'failed' | 'not_run';
      eventSuccessRate?: number;
      totalEvents?: number;
    }> = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Check execution status for this date
      const executions = await this.scheduleExecutionModel.find({
        scheduleId,
        executedAt: {
          $gte: currentDate,
          $lt: nextDate
        }
      }).exec();

      let executionStatus: 'success' | 'failed' | 'not_run' = 'not_run';
      let eventSuccessRate: number | undefined;
      let totalEvents: number | undefined;

      if (executions.length > 0) {
        const hasSuccess = executions.some(e => e.status === 'completed');
        const hasFailed = executions.some(e => e.status === 'failed');
        
        executionStatus = hasSuccess ? 'success' : hasFailed ? 'failed' : 'not_run';

        // If execution succeeded, get event data
        if (executionStatus === 'success') {
          const eventStats = await this.getEventDataStatistics(scheduleId, '', {
            $gte: currentDate,
            $lt: nextDate
          });
          eventSuccessRate = eventStats.successRate;
          totalEvents = eventStats.total;
        }
      }

      dailyData.push({
        date: dateStr,
        executionStatus,
        eventSuccessRate,
        totalEvents
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  }

  private calculateTrends(dailyPerformance: Array<{
    date: string;
    executionStatus: 'success' | 'failed' | 'not_run';
    eventSuccessRate?: number;
  }>): {
    executionTrend: 'improving' | 'declining' | 'stable';
    eventDeliveryTrend: 'improving' | 'declining' | 'stable';
  } {
    const recentDays = dailyPerformance.slice(-7); // Last 7 days
    const olderDays = dailyPerformance.slice(-14, -7); // Previous 7 days

    // Calculate execution trend
    const recentSuccessRate = recentDays.filter(d => d.executionStatus === 'success').length / recentDays.length;
    const olderSuccessRate = olderDays.filter(d => d.executionStatus === 'success').length / olderDays.length;
    
    const executionTrend = recentSuccessRate > olderSuccessRate + 0.1 ? 'improving' :
                          recentSuccessRate < olderSuccessRate - 0.1 ? 'declining' : 'stable';

    // Calculate event delivery trend
    const recentEventRates = recentDays.filter(d => d.eventSuccessRate !== undefined).map(d => d.eventSuccessRate!);
    const olderEventRates = olderDays.filter(d => d.eventSuccessRate !== undefined).map(d => d.eventSuccessRate!);
    
    const recentAvgEventRate = recentEventRates.length > 0 ? recentEventRates.reduce((a, b) => a + b, 0) / recentEventRates.length : 0;
    const olderAvgEventRate = olderEventRates.length > 0 ? olderEventRates.reduce((a, b) => a + b, 0) / olderEventRates.length : 0;
    
    const eventDeliveryTrend = recentAvgEventRate > olderAvgEventRate + 5 ? 'improving' :
                              recentAvgEventRate < olderAvgEventRate - 5 ? 'declining' : 'stable';

    return { executionTrend, eventDeliveryTrend };
  }

  private async getOverallStatistics(query?: AdminStatsQuery): Promise<ScheduleSystemOverviewStats> {
    const matchCondition: any = {};

    const dateFilter = this.buildDateFilter(query);
      
    if (dateFilter) {
      matchCondition.executedAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalExecutions: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ];

    const [executionResult] = await this.scheduleExecutionModel.aggregate(pipeline);
    
    // Get content and notification rates
    const notificationRate = await this.getNotificationDeliveryRate(dateFilter);

    return {
      totalExecutions: executionResult?.totalExecutions || 0,
      successRate: executionResult ? Math.round((executionResult.successful / executionResult.totalExecutions) * 100) : 0,
      notificationDeliveryRate: notificationRate
    };
  }

  private async getNotificationDeliveryRate(dateFilter: any): Promise<number> {
    const matchCondition: any = { scheduleId: { $exists: true } };
    if (dateFilter) {
      matchCondition.createdAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          }
        }
      }
    ];

    const [result] = await this.notificationModel.aggregate(pipeline);
    return result && result.total > 0 ? Math.round((result.sent / result.total) * 100) : 0;
  }

  private async getEventTypeStatistics(query?: AdminStatsQuery): Promise<ScheduleEventTypeStats[]> {
    const dateFilter = this.buildDateFilter(query);

    const matchCondition: any = {};
    if (dateFilter) {
      matchCondition.executedAt = dateFilter;
    }

    const pipeline: any[] = [
      { $match: matchCondition },
      {
        $group: {
          _id: '$eventName',
          executions: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $round: [{ $multiply: [{ $divide: ['$successful', '$executions'] }, 100] }]
          }
        }
      },
      { $sort: { executions: -1 as -1 } }
    ];

    const results = await this.scheduleExecutionModel.aggregate(pipeline);
    
    return results.map(r => ({
      eventName: r._id,
      executions: r.executions,
      successRate: r.successRate
    }));
  }

  private async getRecentExecutions(query?: AdminStatsQuery): Promise<ScheduleRecentExecutionStats[]> {
    const dateFilter = this.buildDateFilter(query);
    const matchCondition: any = {};
    if (dateFilter) {
      matchCondition.executedAt = dateFilter;
    }

    const executions = await this.scheduleExecutionModel
      .find(matchCondition)
      .sort({ executedAt: -1 })
      .limit(10)
      .select('executedAt eventName status timezone')
      .exec();

    return executions.map(e => ({
      executedAt: e.executedAt,
      eventName: e.eventName,
      status: e.status,
      timezone: e.timezone
    }));
  }

  private determineEventType(eventName: string): 'notification' {
    return 'notification';
  }

  private buildDateFilter(query?: AdminStatsQuery): any {
    if (!query?.startDate && !query?.endDate) return null;
    
    const filter: any = {};
    if (query.startDate) {
      filter.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.$lte = endDate;
    }
    
    return Object.keys(filter).length > 0 ? filter : null;
  }

  private getDateRange(query: AdminStatsQuery): { startDate: Date; endDate: Date } {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : 
      new Date(endDate.getTime() - (query.limit || 30) * 24 * 60 * 60 * 1000);
    
    return { startDate, endDate };
  }
}