import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateUserProfileDto } from './create-user-profile.dto';

// For updates, we omit firebaseUid (can't change) and roles (separate endpoint)
export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserProfileDto, ['firebaseUid', 'roles'] as const)
) {}