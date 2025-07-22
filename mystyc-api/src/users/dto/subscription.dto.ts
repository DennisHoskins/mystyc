import { IsOptional, IsEnum, IsNumber, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';

export class SubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionLevel)
  level?: SubscriptionLevel;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditBalance?: number;
}
