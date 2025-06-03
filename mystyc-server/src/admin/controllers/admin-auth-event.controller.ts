import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { logger } from '@/util/logger';

@Controller('admin/auth-event')
export class AdminAuthEventController {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
  ) {}

  @Get(':eventId')
  @Roles(UserRole.ADMIN)
  async getAuthEvent(@Param('eventId') eventId: string) {
    logger.info('Admin fetching auth event by ID', { eventId }, 'AdminAuthEventController');
    
    const event = await this.authEventService.findById(eventId);
    
    if (!event) {
      logger.warn('Auth event not found', { eventId }, 'AdminAuthEventController');
      throw new NotFoundException('Auth event not found');
    }

    logger.info('Auth event retrieved', { eventId }, 'AdminAuthEventController');
    return event;
  }

  @Get(':eventId/device')
  @Roles(UserRole.ADMIN)
  async getAuthEventDevice(@Param('eventId') eventId: string) {
    logger.info('Admin fetching device for auth event', { eventId }, 'AdminAuthEventController');
    
    try {
      const authEvent = await this.authEventService.findById(eventId);
      
      if (!authEvent) {
        logger.warn('Auth event not found', { eventId }, 'AdminAuthEventController');
        throw new NotFoundException('Auth event not found');
      }

      const device = await this.deviceService.findByDeviceId(authEvent.deviceId);
      
      if (!device) {
        logger.warn('Device not found for auth event', { 
          eventId, 
          deviceId: authEvent.deviceId 
        }, 'AdminAuthEventController');
        throw new NotFoundException('Device not found for this auth event');
      }

      logger.info('Device found for auth event', {
        eventId,
        deviceId: device.deviceId,
        firebaseUid: device.firebaseUid
      }, 'AdminAuthEventController');

      return {
        authEvent,
        device
      };
    } catch (error) {
      logger.error('Failed to get device for auth event', {
        eventId,
        error: error.message
      }, 'AdminAuthEventController');

      throw error;
    }
  }
}