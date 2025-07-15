import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SchedulesService } from './schedules.service';
import { ScheduleExecutionsService } from './schedule-executions.service';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';
import { ScheduleExecution, ScheduleExecutionSchema } from './schemas/schedule-execution.schema';
import { DevicesModule } from '@/devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: ScheduleExecution.name, schema: ScheduleExecutionSchema }
    ]),
    DevicesModule
  ],
  providers: [SchedulesService, ScheduleExecutionsService],
  exports: [SchedulesService, ScheduleExecutionsService],
})
export class SchedulesModule {}