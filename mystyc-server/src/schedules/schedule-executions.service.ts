import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ScheduleExecution, ScheduleExecutionInput, validateScheduleExecutionInputSafe  } from 'mystyc-common/schemas/schedule-execution.schema';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ScheduleExecution as ScheduleExecutionSchema, ScheduleExecutionDocument } from './schemas/schedule-execution.schema';

@Injectable()
export class ScheduleExecutionsService {
  constructor(
    @InjectModel(ScheduleExecutionSchema.name) private scheduleExecutionModel: Model<ScheduleExecutionDocument>,
  ) {}

  /**
   * Creates a new schedule execution log entry
   * @param createDto - Schedule execution creation data
   * @returns Promise<ScheduleExecution> - Created execution log
   */
  async create(createDto: ScheduleExecutionInput): Promise<ScheduleExecution> {
    logger.info('Creating schedule execution log', {
      scheduleId: createDto.scheduleId,
      eventName: createDto.eventName,
      timezone: createDto.timezone || 'global'
    }, 'ScheduleExecutionService');

    const executionData = {
      scheduleId: createDto.scheduleId,
      eventName: createDto.eventName,
      scheduledTime: createDto.scheduledTime,
      executedAt: new Date(),
      timezone: createDto.timezone,
      localTime: createDto.localTime,
      status: 'running' as const
    };

    const validation = validateScheduleExecutionInputSafe(executionData);
    if (!validation.success) {
      throw validation.error;
    }
        
    try {
      const executionLog = new this.scheduleExecutionModel({
        scheduleId: createDto.scheduleId,
        eventName: createDto.eventName,
        scheduledTime: createDto.scheduledTime,
        executedAt: new Date(),
        timezone: createDto.timezone,
        localTime: createDto.localTime,
        status: 'running'
      });

      const saved = await executionLog.save();

      logger.info('Schedule execution log created', {
        executionId: saved._id.toString(),
        scheduleId: createDto.scheduleId
      }, 'ScheduleExecutionService');

      return this.transformToExecution(saved);
    } catch (error) {
      logger.error('Failed to create schedule execution log', {
        scheduleId: createDto.scheduleId,
        eventName: createDto.eventName,
        error
      }, 'ScheduleExecutionService');
      throw error;
    }
  }

  /**
   * Updates the status of a schedule execution
   * @param executionId - Execution log ID
   * @param status - New status
   * @param error - Error message if failed
   * @param duration - Execution duration in milliseconds
   * @returns Promise<void>
   */
  async updateStatus(
    executionId: string, 
    status: 'completed' | 'failed' | 'timeout', 
    error?: string,
    duration?: number
  ): Promise<void> {
    logger.info('Updating schedule execution status', {
      executionId,
      status,
      duration
    }, 'ScheduleExecutionService');

    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (error) {
        updateData.error = error;
      }

      if (duration !== undefined) {
        updateData.duration = duration;
      }

      await this.scheduleExecutionModel.findByIdAndUpdate(executionId, updateData);

      logger.info('Schedule execution status updated', {
        executionId,
        status
      }, 'ScheduleExecutionService');
    } catch (updateError) {
      logger.error('Failed to update schedule execution status', {
        executionId,
        status,
        error: updateError
      }, 'ScheduleExecutionService');
      throw updateError;
    }
  }

  /**
   * Get total count (admin)
   */
  async getTotal(): Promise<number> {
    return await this.scheduleExecutionModel.countDocuments();
  }

  /**
   * Find all executions with pagination (admin)
   */
  async findAll(query: BaseAdminQuery): Promise<ScheduleExecution[]> {
    const { limit = 100, offset = 0, sortBy = 'executedAt', sortOrder = 'desc' } = query;

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const executions = await this.scheduleExecutionModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return executions.map(execution => this.transformToExecution(execution));
  }

  /**
   * Find execution by ID (admin)
   */
  async findById(id: string): Promise<ScheduleExecution | null> {
    logger.debug('Finding execution by ID', { id }, 'ScheduleExecutionService');

    try {
      const execution = await this.scheduleExecutionModel.findById(id).exec();
      if (!execution) return null;
      return this.transformToExecution(execution);
    } catch (error) {
      return null;
    }
  }

  /**
   * Finds execution logs by schedule ID with pagination
   * @param scheduleId - Schedule ID to find executions for
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<ScheduleExecution[]> - Array of execution logs
   */
  async findByScheduleId(scheduleId: string, query: BaseAdminQuery): Promise<ScheduleExecution[]> {
    const { limit = 50, offset = 0, sortBy = 'executedAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding schedule executions', {
      scheduleId,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'ScheduleExecutionService');

    try {
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const executions = await this.scheduleExecutionModel
        .find({ scheduleId })
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .exec();

      logger.debug('Schedule executions found', {
        scheduleId,
        count: executions.length
      }, 'ScheduleExecutionService');

      return executions.map(execution => this.transformToExecution(execution));
    } catch (error) {
      logger.error('Failed to find schedule executions', {
        scheduleId,
        error
      }, 'ScheduleExecutionService');
      throw error;
    }
  }

  /**
   * Gets total count of executions for a schedule
   * @param scheduleId - Schedule ID
   * @returns Promise<number> - Total execution count
   */
  async getTotalByScheduleId(scheduleId: string): Promise<number> {
    return await this.scheduleExecutionModel.countDocuments({ scheduleId });
  }

  /**
   * Finds the most recent execution for a schedule
   * @param scheduleId - Schedule ID
   * @returns Promise<ScheduleExecution | null> - Most recent execution or null
   */
  async findLatestByScheduleId(scheduleId: string): Promise<ScheduleExecution | null> {
    logger.debug('Finding latest execution for schedule', { scheduleId }, 'ScheduleExecutionService');

    try {
      const execution = await this.scheduleExecutionModel
        .findOne({ scheduleId })
        .sort({ executedAt: -1 })
        .exec();

      if (!execution) {
        logger.debug('No executions found for schedule', { scheduleId }, 'ScheduleExecutionService');
        return null;
      }

      return this.transformToExecution(execution);
    } catch (error) {
      logger.error('Failed to find latest execution', {
        scheduleId,
        error
      }, 'ScheduleExecutionService');
      throw error;
    }
  }

  /**
   * Gets execution statistics for a schedule
   * @param scheduleId - Schedule ID
   * @returns Promise<{total: number, successful: number, failed: number, successRate: number}>
   */
  async getExecutionStats(scheduleId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  }> {
    logger.debug('Getting execution stats for schedule', { scheduleId }, 'ScheduleExecutionService');

    try {
      const pipeline = [
        { $match: { scheduleId } },
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
    } catch (error) {
      logger.error('Failed to get execution stats', {
        scheduleId,
        error
      }, 'ScheduleExecutionService');
      throw error;
    }
  }

  /**
   * Finds executions within a date range
   * @param scheduleId - Schedule ID
   * @param startDate - Start date for range
   * @param endDate - End date for range
   * @returns Promise<ScheduleExecution[]> - Executions in date range
   */
  async findByDateRange(
    scheduleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ScheduleExecution[]> {
    logger.debug('Finding executions by date range', {
      scheduleId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, 'ScheduleExecutionService');

    try {
      const executions = await this.scheduleExecutionModel
        .find({
          scheduleId,
          executedAt: {
            $gte: startDate,
            $lte: endDate
          }
        })
        .sort({ executedAt: -1 })
        .exec();

      return executions.map(execution => this.transformToExecution(execution));
    } catch (error) {
      logger.error('Failed to find executions by date range', {
        scheduleId,
        error
      }, 'ScheduleExecutionService');
      throw error;
    }
  }

  /**
   * Transforms MongoDB document to ScheduleExecution interface
   * @param doc - MongoDB execution document
   * @returns ScheduleExecution - Clean execution object
   */
  private transformToExecution(doc: ScheduleExecutionDocument): ScheduleExecution {
    return {
      _id: doc._id.toString(),
      scheduleId: doc.scheduleId,
      eventName: doc.eventName,
      scheduledTime: doc.scheduledTime,
      executedAt: doc.executedAt,
      timezone: doc.timezone,
      localTime: doc.localTime,
      status: doc.status,
      error: doc.error,
      duration: doc.duration,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}