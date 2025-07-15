import { 
  IsString, 
  IsNotEmpty, 
  IsOptional,
  IsDateString,
  ValidateNested,
  IsInt,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { SanitizeText } from '@/common/decorators/sanitization.decorators';

export class ScheduleTimeDto {
  @IsInt({ message: 'Hour must be an integer' })
  @Min(0, { message: 'Hour must be between 0 and 23' })
  @Max(23, { message: 'Hour must be between 0 and 23' })
  @Type(() => Number)
  hour: number;

  @IsInt({ message: 'Minute must be an integer' })
  @Min(0, { message: 'Minute must be between 0 and 59' })
  @Max(59, { message: 'Minute must be between 0 and 59' })
  @Type(() => Number)
  minute: number;
}

export class CreateScheduleExecutionDto {
  @IsString({ message: 'Schedule ID must be a string' })
  @IsNotEmpty({ message: 'Schedule ID cannot be empty' })
  @SanitizeText('scheduleId', { maxLength: 50 })
  scheduleId: string;

  @IsString({ message: 'Event name must be a string' })
  @IsNotEmpty({ message: 'Event name cannot be empty' })
  @SanitizeText('eventName', { maxLength: 100 })
  eventName: string;

  @ValidateNested()
  @Type(() => ScheduleTimeDto)
  scheduledTime: ScheduleTimeDto;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @SanitizeText('timezone', { maxLength: 50, allowEmpty: true })
  timezone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Local time must be a valid date' })
  localTime?: Date;
}