import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

import { CreateUserDto } from './create-user.dto';
import { SanitizeText } from '@/common/decorators/sanitization.decorators';

// For updates, we omit firebaseUid (can't change) and roles (separate endpoint)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['firebaseUid', 'roles'] as const)
) {
  // Allow internal updates to currentDeviceId (not exposed to external API)
  @IsOptional()
  @IsString()
  @SanitizeText('currentDeviceId')
  currentDeviceId?: string;
}