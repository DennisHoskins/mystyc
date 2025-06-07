import { Controller } from '@nestjs/common';

import { DeviceService } from '@/devices/device.service';
import { Device } from '@/common/interfaces/device.interface';
import { AdminController } from './admin.controller';

@Controller('admin/devices')
export class AdminDevicesController extends AdminController<Device> {
  protected serviceName = 'Devices';
  
  constructor(protected service: DeviceService) {
    super();
  }
}