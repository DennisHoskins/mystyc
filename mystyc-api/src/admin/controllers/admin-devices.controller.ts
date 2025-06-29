import { Get, Controller, Param, UseGuards, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { Device } from '@/common/interfaces/device.interface';
import { DeviceService } from '@/devices/device.service';
import { AdminController } from './admin.controller';
import { logger } from '@/common/util/logger';

@Controller('admin/devices')
export class AdminDevicesController extends AdminController<Device> {
  protected serviceName = 'Devices';
  
  constructor(protected service: DeviceService) {
    super();
  }

  /**
   * Get device by deviceId
   * @param id - Item identifier
   * @returns Promise<T> - Single item
   * @throws NotFoundException when item not found
   */
  @Get(':deviceId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findById(@Param('deviceId') deviceId: string): Promise<Device> {
    logger.info(`Admin fetching Device by ID`, { deviceId }, `AdminDeviceController`);

    const device = await this.service.findByDeviceId(deviceId);
    
    if (!device) {
      logger.warn(`Device not found`, { deviceId }, `AdminDeviceController`);
      throw new NotFoundException(`Device not found`);
    }

    logger.info(`Device retrieved successfully`, { deviceId }, `AdminDeviceController`);
    return device;
  }
}