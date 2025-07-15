import { 
  IsString, 
  IsNotEmpty, 
  IsBoolean,
  IsOptional,
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

export class CreateScheduleDto {
  @ValidateNested()
  @Type(() => ScheduleTimeDto)
  time: ScheduleTimeDto;

  @IsString({ message: 'Event name must be a string' })
  @IsNotEmpty({ message: 'Event name cannot be empty' })
  @SanitizeText('event_name', { maxLength: 100 })
  event_name: string;

  @IsOptional()
  @IsBoolean({ message: 'Enabled must be a boolean' })
  @Type(() => Boolean)
  enabled?: boolean = true;

  @IsOptional()
  @IsBoolean({ message: 'Timezone aware must be a boolean' })
  @Type(() => Boolean)
  timezone_aware?: boolean = false;
}