import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScheduleService } from './schedule.service';
import { ScheduleExecutionService } from './schedule-execution.service';
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
  providers: [ScheduleService, ScheduleExecutionService],
  exports: [ScheduleService, ScheduleExecutionService],
})
export class ScheduleModule {}