import { Controller } from '@nestjs/common';

import { AdminDevicesStatsService } from '@/admin/services/admin-devices-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Devices');

@Controller('admin/stats/devices')
export class AdminDevicesStatsController extends BaseController {
  constructor(public service: AdminDevicesStatsService) {
    super(service);
  }
}