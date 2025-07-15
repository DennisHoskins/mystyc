import { Controller } from '@nestjs/common';
import { AdminScheduleExecutionsStatsService } from '@/admin/services/admin-schedule-executions-stats.service';
import { createStatsController } from '@/admin/stats/create-stats-controller';

const BaseController = createStatsController('ScheduleExecutions');

@Controller('admin/stats/schedules')
export class AdminScheduleExecutionsStatsController extends BaseController {
  constructor(public service: AdminScheduleExecutionsStatsService) {
    super(service);
  }
}