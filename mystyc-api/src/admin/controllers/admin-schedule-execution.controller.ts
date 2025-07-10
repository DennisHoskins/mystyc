import { Controller } from '@nestjs/common';

import { ScheduleExecutionService } from '@/schedule/schedule-execution.service';
import { ScheduleExecution } from '@/common/interfaces/scheduleExecution.interface';
import { AdminController } from './admin.controller';

@Controller('admin/schedule-executions')
export class AdminScheduleExecutionController extends AdminController<ScheduleExecution> {
  protected serviceName = 'ScheduleExecution';
  
  constructor(protected service: ScheduleExecutionService) {
    super();
  }
}