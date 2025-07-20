import { 
  IsString, 
  IsNotEmpty, 
  IsOptional,
  IsDateString,
  ValidateNested,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleTimeDto } from './create-schedule.dto';

export class CreateScheduleExecutionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  scheduleId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  eventName!: string;

  @ValidateNested()
  @Type(() => ScheduleTimeDto)
  scheduledTime!: ScheduleTimeDto;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsDateString()
  localTime?: Date;
}