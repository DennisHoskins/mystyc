import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';

import { Schedule as ScheduleInterface, ScheduleInput, validateScheduleInputSafe } from 'mystyc-common/schemas/schedule.schema';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { timezone } from '@/common/util/timezone';
import { logger } from '@/common/util/logger';
import { DevicesService } from '@/devices/devices.service';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { ScheduleExecutionsService } from './schedule-executions.service';

@Injectable()
export class SchedulesService {
  private cachedTimezones: Array<{timezone: string, offsetHours: number}> = [];

  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly devicesService: DevicesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly scheduleExecutionService: ScheduleExecutionsService,
  ) {
    // Initialize cache on startup
    this.initializeTimezoneCache();
  }

  // Initialize timezone cache when service starts
  private async initializeTimezoneCache(): Promise<void> {
    try {
      logger.info('Initializing timezone cache on startup', {}, 'ScheduleService');
      await this.refreshTimezoneCache();
    } catch (error) {
      logger.error('Failed to initialize timezone cache', {
        error
      }, 'ScheduleService');
      // Don't throw - let the service start even if cache fails
    }
  }

  // CRUD methods

  async create(createScheduleDto: ScheduleInput): Promise<ScheduleInterface> {
    logger.info('Creating new schedule', {
      eventName: createScheduleDto.event_name,
      time: createScheduleDto.time,
      timezoneAware: createScheduleDto.timezone_aware,
      enabled: createScheduleDto.enabled
    }, 'ScheduleService');

    const validation = validateScheduleInputSafe(createScheduleDto);
    if (!validation.success) {
      throw validation.error;
    }

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
        error,
      }, 'ScheduleService');

      throw new ConflictException('Could not create schedule');
    }
  }

  async update(id: string, updateScheduleDto: Partial<ScheduleInput>): Promise<ScheduleInterface | null> {
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
        error
      }, 'ScheduleService');

      throw error;
    }
  }

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
        error
      }, 'ScheduleService');

      throw error;
    }
  }  

  // Cron Jobs

  @OnEvent('schedule.update.timezones')
  async refreshTimezoneCache() {
    logger.info('Refreshing timezone cache', {}, 'ScheduleService');
    
    try {
      const uniqueTimezones = await this.devicesService.getUniqueTimezones();

      logger.info("Got timezones from devices", { 
        count: uniqueTimezones.length,
        uniqueTimezones: uniqueTimezones 
      }, "ScheduleService")

      this.cachedTimezones = await timezone.getTimezonesWithOffsets(uniqueTimezones);
      
      logger.info('Timezone cache refreshed', { 
        count: this.cachedTimezones.length,
        cachedTimezones: this.cachedTimezones
      }, 'ScheduleService');
    } catch (error) {
      logger.error('Failed to refresh timezone cache', {
        error
      }, 'ScheduleService');
      // Keep using existing cache
    }
  }

  async getTimezoneCache(): Promise<Array<{timezone: string, offsetHours: number}> | null>  {
    logger.info('Getting timezone cache', {}, 'ScheduleService');
    
    try {
      const uniqueTimezones = await this.devicesService.getUniqueTimezones();

      logger.info("Got timezones from devices", { 
        count: uniqueTimezones.length,
        uniqueTimezones: uniqueTimezones 
      }, "ScheduleService")
      const cachedTimezones = await timezone.getTimezonesWithOffsets(uniqueTimezones);
      
      logger.info('Got timezone cache', { 
        count: this.cachedTimezones.length,
        cachedTimezones: this.cachedTimezones
      }, 'ScheduleService');

      return cachedTimezones;
    } catch (error) {
      logger.error('Failed to get timezone cache', {
        error
      }, 'ScheduleService');
      // Keep using existing cache
    }

    return null;
  }

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
      
      logger.info('Scheduled tasks processing completed, tasks will update success/failure logs', {
        tasksProcessed: tasks.length
      }, 'ScheduleService');
    } catch (error) {
      logger.error('Failed to check scheduled tasks', {
        error
      }, 'ScheduleService');
    }
  }

  // Core Scheduling Logic

  private async processScheduledTask(task: ScheduleInterface, serverTime: Date): Promise<void> {
    const executionStartTime = Date.now();
    let executionLog: any = null;

    if (!task._id) {
      logger.warn('Skipping task with missing ID', { task }, 'ScheduleService');
      return;      
    }

    try {
      if (task.timezone_aware) {
        // Check cached timezones against current server time
        const matchingTimezones = await this.getMatchingTimezones(task.time, serverTime);
        
        logger.debug('[processScheduledTask] Processing timezone-aware task', {
          taskId: task._id,
          eventName: task.event_name,
          targetTime: task.time,
          matchingTimezones: matchingTimezones.length
        }, 'ScheduleService');

        for (const timezoneData of matchingTimezones) {
          // Create execution log for this timezone
          executionLog = await this.scheduleExecutionService.create({
            scheduleId: task._id,
            eventName: task.event_name,
            scheduledTime: task.time,
            timezone: timezoneData.timezone,
            localTime: this.getLocalTime(serverTime, timezoneData.offsetHours)
          });

          const executionId = executionLog._id;

          logger.debug("[processScheduledTask] Emitting Event", { executionId }, 'ScheduleService')

          await this.emitScheduledEvent(task, executionId, timezoneData.timezone, timezoneData);
        }
      } else {
        if (serverTime.getHours() != task.time.hour || serverTime.getMinutes() != task.time.minute) {
          return;
        }
        
        // Create execution log for global schedule
        executionLog = await this.scheduleExecutionService.create({
          scheduleId: task._id,
          eventName: task.event_name,
          scheduledTime: task.time
        });

        logger.debug('[processScheduledTask] Processing global task', {
          taskId: task._id,
          eventName: task.event_name,
          targetTime: task.time,
          executionId: executionLog._id
        }, 'ScheduleService');

        await this.emitScheduledEvent(task, undefined, undefined, executionLog._id);
      }
    } catch (error) {
      // Update execution log as failed if we created one
      if (error instanceof Error) {
        if (executionLog) {
          const duration = Date.now() - executionStartTime;
          await this.scheduleExecutionService.updateStatus(executionLog._id, 'failed', error.message, duration);
        }
        
        await this.logScheduleFailure(task._id, task.event_name, error);
      }
    }
  }

  private async emitScheduledEvent(
    task: ScheduleInterface, 
    executionId?: string,
    timezone?: string,
    timezoneData?: {timezone: string, offsetHours: number},
  ): Promise<void> {
    const payload: any = {
      scheduleId: task._id,
      executionId,
      eventName: task.event_name,
      scheduledTime: task.time,
      executedAt: new Date().toISOString(),
    };

    if (timezone && timezoneData) {
      payload.timezone = timezone;
      payload.localTime = this.getLocalTime(new Date(), timezoneData.offsetHours).toISOString();
    }

    logger.info('Emitting scheduled event', {
      eventName: task.event_name,
      scheduleId: task._id,
      executionId,
      timezone: timezone || 'global',
      payload
    }, 'ScheduleService');

    this.eventEmitter.emit(task.event_name, payload);
  }

  private async getMatchingTimezones(
    targetTime: {hour: number, minute: number}, 
    serverTime: Date
  ): Promise<Array<{timezone: string, offsetHours: number}>> {

    // Only refresh cache if it's empty
    if (this.cachedTimezones.length === 0) {
      logger.info("[getMatchingTimezones] Cache empty, refreshing...");
      const uniqueTimezones = await this.devicesService.getUniqueTimezones();

      logger.info("[getMatchingTimezones] Got timezones from devices", { 
        count: uniqueTimezones.length,
        uniqueTimezones: uniqueTimezones 
      }, "ScheduleService")

      this.cachedTimezones = await timezone.getTimezonesWithOffsets(uniqueTimezones);
      
      logger.info('[getMatchingTimezones] Timezone cache refreshed', { 
        count: this.cachedTimezones.length,
        cachedTimezones: this.cachedTimezones
      }, 'ScheduleService');
    } else {
      logger.info("[getMatchingTimezones] Using cached timezones");
    }
    
    logger.info("[getMatchingTimezones] getting matching timezones", { timezones: this.cachedTimezones, serverTime: serverTime, targetTime: targetTime });

    return this.cachedTimezones.filter(tzData => {
      const localTime = this.getLocalTime(serverTime, tzData.offsetHours);

      logger.info("[getMatchingTimezones] localTime:", { tzData, localTime, localHours: localTime.getHours(), localMinutes: localTime.getMinutes() });

      return localTime.getHours() === targetTime.hour && 
             localTime.getMinutes() === targetTime.minute;
    });
  }

  private getLocalTime(serverTime: Date, offsetHours: number): Date {
    const localTime = new Date(serverTime);
    localTime.setHours(localTime.getHours() + offsetHours);
    return localTime;
  }

  // Database Operations

  private async getScheduledTasks(): Promise<ScheduleInterface[]> {
    const tasks = await this.scheduleModel
      .find({ enabled: true })
      .sort({ 'time.hour': 1, 'time.minute': 1 })
      .exec();

    return tasks.map(task => this.transformToInterface(task));
  }

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

  async getTotal(): Promise<number> {
    return await this.scheduleModel.countDocuments();
  }

  async findAll(queryRaw: BaseAdminQuery): Promise<ScheduleInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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

  private async logScheduleSuccess(taskId: string, eventName: string): Promise<void> {
    logger.info('Schedule executed successfully', {
      taskId,
      eventName,
      executedAt: new Date().toISOString()
    }, 'ScheduleService');
  }

  private async logScheduleFailure(taskId: string, eventName: string, error: Error): Promise<void> {
    logger.error('Schedule execution failed', {
      taskId,
      eventName,
      error,
      executedAt: new Date().toISOString()
    }, 'ScheduleService');
  }

  // Utility Methods

  private transformToInterface(doc: ScheduleDocument): ScheduleInterface {
    return {
      _id: doc._id.toString(),
      time: {
        hour: doc.time.hour,
        minute: doc.time.minute
      },
      event_name: doc.event_name,
      enabled: doc.enabled,
      timezone_aware: doc.timezone_aware,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}