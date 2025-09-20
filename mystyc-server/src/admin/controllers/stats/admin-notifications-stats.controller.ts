import { Controller } from '@nestjs/common';

import { AdminNotificationsStatsService } from '@/admin/services/admin-notifications-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Notifications');

@Controller('admin/stats/notifications')
export class AdminNotificationsStatsController extends BaseController {
  constructor(public service: AdminNotificationsStatsService) {
    super(service);
  }
}