import { IsOptional, IsIn, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminStatsQueryDto {
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  period?: 'daily' | 'weekly' | 'monthly' = 'daily';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(365)
  limit?: number = 30;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  maxRecords?: number = 10000;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}