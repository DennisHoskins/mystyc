import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { Schedule as ScheduleInterface } from '@/common/interfaces/schedule.interface';
import { DevicesService } from '@/devices/devices.service';
import { timezone } from '@/common/util/timezone';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class ScheduleService {
  private cachedTimezones: Array<{timezone: string, offsetHours: number}> = [];

  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly devicesService: DevicesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // CRUD methods

  /**
   * Creates a new schedule
   * @param createScheduleDto - Schedule creation data
   * @returns Promise<ScheduleInterface> - Created schedule
   * @throws ConflictException when schedule creation fails
   */
  async create(createScheduleDto: CreateScheduleDto): Promise<ScheduleInterface> {
    logger.info('Creating new schedule', {
      eventName: createScheduleDto.event_name,
      time: createScheduleDto.time,
      timezoneAware: createScheduleDto.timezone_aware,
      enabled: createScheduleDto.enabled
    }, 'ScheduleService');

    try {
      const newSchedule = new this.scheduleModel({
        time: createScheduleDto.time,
        event_name: createScheduleDto.event_name,
        enabled: createScheduleDto.enabled ?? true,
        timezone_aware: createScheduleDto.timezone_aware ?? false
      });

      const savedSchedule = await newSchedule.save();

      logger.info('Schedule created successfully', {
        scheduleId: savedSchedule._id.toString(),
        eventName: savedSchedule.event_name,
        time: savedSchedule.time
      }, 'ScheduleService');

      return this.transformToInterface(savedSchedule);
    } catch (error) {
      logger.error('Failed to create schedule', {
        eventName: createScheduleDto.event_name,
        error: error.message,
        code: error.code
      }, 'ScheduleService');

      throw new ConflictException('Could not create schedule');
    }
  }

  /**
   * Updates an existing schedule
   * @param id - Schedule ID
   * @param updateScheduleDto - Schedule update data
   * @returns Promise<ScheduleInterface | null> - Updated schedule or null if not found
   */
  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleInterface | null> {
    logger.info('Updating schedule', {
      scheduleId: id,
      updateFields: Object.keys(updateScheduleDto)
    }, 'ScheduleService');

    try {
      const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
        id,
        { 
          ...updateScheduleDto,
          updatedAt: new Date()
        },
        { 
          new: true, 
          runValidators: true 
        }
      ).exec();

      if (!updatedSchedule) {
        logger.warn('Schedule update failed - not found', { scheduleId: id }, 'ScheduleService');
        return null;
      }

      logger.info('Schedule updated successfully', {
        scheduleId: id,
        eventName: updatedSchedule.event_name,
        enabled: updatedSchedule.enabled
      }, 'ScheduleService');

      return this.transformToInterface(updatedSchedule);
    } catch (error) {
      logger.error('Failed to update schedule', {
        scheduleId: id,
        error: error.message
      }, 'ScheduleService');

      throw error;
    }
  }

  /**
   * Deletes a schedule
   * @param id - Schedule ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    logger.info('Deleting schedule', { scheduleId: id }, 'ScheduleService');

    try {
      const result = await this.scheduleModel.findByIdAndDelete(id).exec();

      if (!result) {
        logger.warn('Schedule deletion failed - not found', { scheduleId: id }, 'ScheduleService');
        return false;
      }

      logger.info('Schedule deleted successfully', {
        scheduleId: id,
        eventName: result.event_name
      }, 'ScheduleService');

      return true;
    } catch (error) {
      logger.error('Failed to delete schedule', {
        scheduleId: id,
        error: error.message
      }, 'ScheduleService');

      throw error;
    }
  }  

  // Cron Jobs

  /**
   * Refreshes timezone cache daily at 2am
   */
  @Cron('0 2 * * *')
  async refreshTimezoneCache() {
    logger.info('Refreshing timezone cache', {}, 'ScheduleService');
    
    try {
      const uniqueTimezones = await this.devicesService.getUniqueTimezones();
      this.cachedTimezones = await timezone.getTimezonesWithOffsets(uniqueTimezones);
      
      logger.info('Timezone cache refreshed', { 
        count: this.cachedTimezones.length 
      }, 'ScheduleService');
    } catch (error) {
      logger.error('Failed to refresh timezone cache', {
        error: error.message
      }, 'ScheduleService');
      // Keep using existing cache
    }
  }

  /**
   * Main scheduler - runs every 30 minutes to check for scheduled tasks
   */
  @Cron('*/30 * * * *')
  async checkScheduledTasks() {
    logger.info('Checking scheduled tasks', {}, 'ScheduleService');
    
    try {
      const tasks = await this.getScheduledTasks();
      const serverTime = new Date();
      
      logger.debug('Found scheduled tasks', { 
        count: tasks.length,
        serverTime: serverTime.toISOString()
      }, 'ScheduleService');

      for (const task of tasks) {
        await this.processScheduledTask(task, serverTime);
      }
      
      logger.info('Scheduled tasks processing completed', {
        tasksProcessed: tasks.length
      }, 'ScheduleService');
    } catch (error) {
      logger.error('Failed to check scheduled tasks', {
        error: error.message
      }, 'ScheduleService');
    }
  }

  // Core Scheduling Logic

  /**
   * Processes a single scheduled task
   */
  private async processScheduledTask(task: ScheduleInterface, serverTime: Date): Promise<void> {
    try {
      if (task.timezone_aware) {
        // Check cached timezones against current server time
        const matchingTimezones = this.getMatchingTimezones(task.time, serverTime);
        
        logger.debug('Processing timezone-aware task', {
          taskId: task._id,
          eventName: task.event_name,
          targetTime: task.time,
          matchingTimezones: matchingTimezones.length
        }, 'ScheduleService');

        for (const timezoneData of matchingTimezones) {
          await this.emitScheduledEvent(task, timezoneData.timezone, timezoneData);
        }
      } else {
        // Run once globally
        logger.debug('Processing global task', {
          taskId: task._id,
          eventName: task.event_name,
          targetTime: task.time
        }, 'ScheduleService');

        await this.emitScheduledEvent(task);
      }
      
      await this.logScheduleSuccess(task._id, task.event_name);
    } catch (error) {
      await this.logScheduleFailure(task._id, task.event_name, error);
    }
  }

  /**
   * Emits the scheduled event with appropriate payload
   */
  private async emitScheduledEvent(
    task: ScheduleInterface, 
    timezone?: string,
    timezoneData?: {timezone: string, offsetHours: number}
  ): Promise<void> {
    const payload: any = {
      taskId: task._id,
      eventName: task.event_name,
      scheduledTime: task.time,
      executedAt: new Date().toISOString()
    };

    if (timezone && timezoneData) {
      payload.timezone = timezone;
      payload.localTime = this.getLocalTime(new Date(), timezoneData.offsetHours).toISOString();
    }

    logger.info('Emitting scheduled event', {
      eventName: task.event_name,
      timezone: timezone || 'global',
      payload
    }, 'ScheduleService');

    this.eventEmitter.emit(task.event_name, payload);
  }

  /**
   * Find timezones where it's currently the target time
   */
  private getMatchingTimezones(
    targetTime: {hour: number, minute: number}, 
    serverTime: Date
  ): Array<{timezone: string, offsetHours: number}> {
    return this.cachedTimezones.filter(tzData => {
      const localTime = this.getLocalTime(serverTime, tzData.offsetHours);
      return localTime.getHours() === targetTime.hour && 
             localTime.getMinutes() === targetTime.minute;
    });
  }

  /**
   * Convert server UTC time to local timezone time
   */
  private getLocalTime(serverTime: Date, offsetHours: number): Date {
    const localTime = new Date(serverTime);
    localTime.setHours(localTime.getHours() + offsetHours);
    return localTime;
  }

  // Database Operations

  /**
   * Get all enabled scheduled tasks
   */
  private async getScheduledTasks(): Promise<ScheduleInterface[]> {
    const tasks = await this.scheduleModel
      .find({ enabled: true })
      .sort({ 'time.hour': 1, 'time.minute': 1 })
      .exec();

    return tasks.map(task => this.transformToInterface(task));
  }

  /**
   * Find schedule by ID (admin)
   */
  async findById(id: string): Promise<ScheduleInterface | null> {
    logger.debug('Finding schedule by ID', { id }, 'ScheduleService');

    try {
      const schedule = await this.scheduleModel.findById(id).exec();
      if (!schedule) return null;
      return this.transformToInterface(schedule);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get total count (admin)
   */
  async getTotal(): Promise<number> {
    return await this.scheduleModel.countDocuments();
  }

  /**
   * Find all schedules with pagination (admin)
   */
  async findAll(query: BaseAdminQueryDto): Promise<ScheduleInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'time.hour', sortOrder = 'asc' } = query;

    const sortObj: any = {};
    if (sortBy.includes('.')) {
      // Handle nested fields like 'time.hour'
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const schedules = await this.scheduleModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return schedules.map(schedule => this.transformToInterface(schedule));
  }

  // Logging and Error Handling

  /**
   * Log successful schedule execution
   */
  private async logScheduleSuccess(taskId: string, eventName: string): Promise<void> {
    logger.info('Schedule executed successfully', {
      taskId,
      eventName,
      executedAt: new Date().toISOString()
    }, 'ScheduleService');
  }

  /**
   * Log failed schedule execution
   */
  private async logScheduleFailure(taskId: string, eventName: string, error: Error): Promise<void> {
    logger.error('Schedule execution failed', {
      taskId,
      eventName,
      error: error.message,
      executedAt: new Date().toISOString()
    }, 'ScheduleService');
  }

  // Utility Methods

  /**
   * Transform document to interface
   */
  private transformToInterface(doc: ScheduleDocument): ScheduleInterface {
    return {
      _id: doc._id.toString(),
      time: doc.time,
      event_name: doc.event_name,
      enabled: doc.enabled,
      timezone_aware: doc.timezone_aware,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}