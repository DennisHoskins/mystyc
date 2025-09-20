import { Controller } from '@nestjs/common';

import { AdminSchedulesStatsService } from '@/admin/services/admin-schedules-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Schedules');

@Controller('admin/stats/schedules')
export class AdminSchedulesStatsController extends BaseController {
  constructor(public service: AdminSchedulesStatsService) {
    super(service);
  }
}