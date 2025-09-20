import { Controller } from '@nestjs/common';

import { AdminAstrologyStatsService } from '@/admin/services/admin-astrology-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('Astrology');

@Controller('admin/stats/astrology')
export class AdminAstrologyStatsController extends BaseController {
  constructor(public service: AdminAstrologyStatsService) {
    super(service);
  }
}