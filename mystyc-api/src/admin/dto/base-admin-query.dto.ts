import { IsOptional, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseAdminQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}