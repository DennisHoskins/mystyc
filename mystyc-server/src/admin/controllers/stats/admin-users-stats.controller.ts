import { Controller } from '@nestjs/common';

import { AdminUsersStatsService } from '@/admin/services/admin-users-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Users');

@Controller('admin/stats/users')
export class AdminUsersStatsController extends BaseController {
  constructor(public service: AdminUsersStatsService) {
    super(service);
  }
}