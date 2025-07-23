import { Controller } from '@nestjs/common';

import { AdminContentStatsService } from '@/admin/services/admin-content-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Content');

@Controller('admin/stats/content')
export class AdminContentStatsController extends BaseController {
  constructor(public service: AdminContentStatsService) {
    super(service);
  }
}