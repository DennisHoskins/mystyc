import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScheduleService } from './schedule.service';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';
import { DevicesModule } from '@/devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema }
    ]),
    DevicesModule
  ],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}