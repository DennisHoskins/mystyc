import { Controller, Get, Param, Query } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { DeviceQueryDto } from '../dto/device-query.dto';
import { logger } from '@/util/logger';

@Controller('admin/devices')
export class AdminDevicesController {

  constructor(
    private readonly deviceService: DeviceService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllDevices(@Query() query: DeviceQueryDto) {
    logger.info('Admin fetching devices', { query }, 'AdminDevicesController');
    
    const devices = await this.deviceService.findAll();
    
    logger.info('Admin devices list retrieved', { count: devices.length }, 'AdminDevicesController');
    return devices;
  }

  @Get(':firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUserDevices(@Param('firebaseUid') firebaseUid: string) {
    logger.info('Admin fetching user devices', { firebaseUid }, 'AdminDevicesController');
    
    const devices = await this.deviceService.findByFirebaseUid(firebaseUid);
    
    logger.info('User devices retrieved', { 
      firebaseUid, 
      count: devices.length 
    }, 'AdminDevicesController');
    
    return devices;
  }
}