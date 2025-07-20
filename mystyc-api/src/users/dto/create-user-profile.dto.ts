import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsArray, 
  IsObject,
  IsEnum, 
  IsISO8601,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@/common/enums/roles.enum';
import { SubscriptionDto } from './subscription.dto';

export class CreateUserProfileDto {
  @IsString()
  firebaseUid: string | undefined;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsEmail()
  @MaxLength(254)
  email: string | undefined;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  zodiacSign?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SubscriptionDto)
  subscription?: SubscriptionDto;
}