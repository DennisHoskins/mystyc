import { IsOptional, IsEnum, IsNumber, IsDate, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';

export class SubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionLevel, { message: 'Invalid subscription level' })
  level?: SubscriptionLevel;

  @IsOptional()
  @IsDate({ message: 'Subscription start date must be a valid date' })
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Credit balance must be a number' })
  @Min(0, { message: 'Credit balance cannot be negative' })
  @Transform(({ value }) => value || 0)
  creditBalance?: number;
}