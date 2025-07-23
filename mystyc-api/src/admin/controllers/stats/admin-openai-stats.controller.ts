import { Controller } from '@nestjs/common';

import { AdminOpenAIStatsService } from '@/admin/services/admin-openai-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('OpenAI');

@Controller('admin/stats/openai')
export class AdminOpenAIStatsController extends BaseController {
  constructor(public service: AdminOpenAIStatsService) {
    super(service);
  }
}