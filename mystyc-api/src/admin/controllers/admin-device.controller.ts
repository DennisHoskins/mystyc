import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { Device } from '@/common/interfaces/device.interface';
import { AdminController } from './admin.controller';
import { logger } from '@/common/util/logger';

@Controller('admin/device')
export class AdminDeviceController extends AdminController<Device> {
  protected serviceName = 'Device';

  constructor(
    protected service: DeviceService,
    private readonly authEventService: AuthEventService
  ) {
    super();
  }

  // GET Methods (Read Operations)

  /**
   * Finds all auth events for a specific device with pagination (admin use)
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<AuthEvent[]> - Array of device's auth events, newest first
   */
  @Get(':deviceId/auth-events')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
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