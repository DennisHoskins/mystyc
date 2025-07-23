import { Controller } from '@nestjs/common';

import { AdminAuthEventsStatsService } from '@/admin/services/admin-auth-events-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('AuthEvents');

@Controller('admin/stats/auth-events')
export class AdminAuthEventsStatsController extends BaseController {
  constructor(public service: AdminAuthEventsStatsService) {
    super(service);
  }
}