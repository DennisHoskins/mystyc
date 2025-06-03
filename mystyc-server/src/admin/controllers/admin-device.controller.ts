import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { logger } from '@/util/logger';

@Controller('admin/device')
export class AdminDeviceController {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
  ) {}

  @Get(':deviceId')
  @Roles(UserRole.ADMIN)
  async getDevice(@Param('deviceId') deviceId: string) {
    logger.info('Admin fetching device by device ID', { deviceId }, 'AdminDeviceController');
    
    try {
      const device = await this.deviceService.findByDeviceId(deviceId);
      
      if (!device) {
        logger.warn('Device not found', { deviceId }, 'AdminDeviceController');
        throw new NotFoundException('Device not found');
      }

      logger.info('Device retrieved successfully', { 
        deviceId,
        firebaseUid: device.firebaseUid 
      }, 'AdminDeviceController');
      
      return device;
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get device', {
        deviceId,
        error: error.message
      }, 'AdminDeviceController');
      
      throw error;
    }
  }

  @Get(':deviceId/auth-events')
  @Roles(UserRole.ADMIN)
  async getDeviceAuthEvents(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    logger.info('Admin fetching device auth events', { 
      deviceId,
      limit,
      offset 
    }, 'AdminDeviceController');
    
    const events = await this.authEventService.findByDeviceId(
      deviceId,
      limit || 50,
      offset || 0
    );
    
    logger.info('Device auth events retrieved', { 
      deviceId,
      count: events.length 
    }, 'AdminDeviceController');
    
    return events;
  }
}