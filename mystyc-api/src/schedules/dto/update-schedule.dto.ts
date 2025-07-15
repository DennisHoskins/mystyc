import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  // All fields from CreateScheduleDto are now optional for updates
  // This includes:
  // - time?: ScheduleTimeDto
  // - event_name?: string  
  // - enabled?: boolean
  // - timezone_aware?: boolean
}