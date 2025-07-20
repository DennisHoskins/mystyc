import { 
  IsString, 
  IsNotEmpty, 
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  Max,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleTimeDto {
  @IsInt()
  @Min(0)
  @Max(23)
  @Type(() => Number)
  hour: number = 0;

  @IsInt()
  @Min(0)
  @Max(59)
  @Type(() => Number)
  minute: number = 0;
}

export class CreateScheduleDto {
  @ValidateNested()
  @Type(() => ScheduleTimeDto)
  time: ScheduleTimeDto | undefined;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  event_name: string | undefined;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  timezone_aware?: boolean = false;
}
