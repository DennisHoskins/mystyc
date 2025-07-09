import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { ScheduleService } from '@/schedule/schedule.service';
import { Schedule } from '@/common/interfaces/schedule.interface';
import { AdminController } from './admin.controller';
import { CreateScheduleDto } from '@/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@/schedule/dto/update-schedule.dto';
import { logger } from '@/common/util/logger';

@Controller('admin/schedules')
export class AdminScheduleController extends AdminController<Schedule> {
  protected serviceName = 'Schedule';
  
  constructor(protected service: ScheduleService) {
    super();
  }

  // CREATE Operations

  /**
   * Creates a new schedule entry
   * @param createScheduleDto - Schedule creation data
   * @returns Promise<Schedule> - Created schedule
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    logger.info('Admin creating new schedule', {
      eventName: createScheduleDto.event_name,
      time: createScheduleDto.time,
      timezoneAware: createScheduleDto.timezone_aware,
      enabled: createScheduleDto.enabled
    }, 'AdminScheduleController');

    try {
      const schedule = await this.service.create(createScheduleDto);
      
      logger.info('Schedule created successfully', {
        scheduleId: schedule._id,
        eventName: schedule.event_name
      }, 'AdminScheduleController');

      return schedule;
    } catch (error) {
      logger.error('Failed to create schedule', {
        eventName: createScheduleDto.event_name,
        error: error.message
      }, 'AdminScheduleController');
      throw error;
    }
  }

  // UPDATE Operations

  /**
   * Updates an existing schedule
   * @param id - Schedule ID
   * @param updateScheduleDto - Schedule update data
   * @returns Promise<Schedule> - Updated schedule
   * @throws NotFoundException when schedule not found
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ): Promise<Schedule> {
    logger.info('Admin updating schedule', {
      scheduleId: id,
      updateFields: Object.keys(updateScheduleDto)
    }, 'AdminScheduleController');

    try {
      const schedule = await this.service.update(id, updateScheduleDto);
      
      if (!schedule) {
        logger.warn('Schedule update failed - not found', { scheduleId: id }, 'AdminScheduleController');
        throw new NotFoundException('Schedule not found');
      }

      logger.info('Schedule updated successfully', {
        scheduleId: id,
        eventName: schedule.event_name
      }, 'AdminScheduleController');

      return schedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      logger.error('Failed to update schedule', {
        scheduleId: id,
        error: error.message
      }, 'AdminScheduleController');
      throw error;
    }
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
        error: error.message
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
        error: error.message
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
        error: error.message
      }, 'AdminScheduleController');
      throw error;
    }
  }
}