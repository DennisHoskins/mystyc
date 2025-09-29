import { Controller } from '@nestjs/common';

import { AdminSubscriptionsStatsService } from '@/admin/services/admin-subscriptions-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Subscriptions');

@Controller('admin/stats/subscriptions')
export class AdminSubscriptionsStatsController extends BaseController {
  constructor(public service: AdminSubscriptionsStatsService) {
    super(service);
  }
}