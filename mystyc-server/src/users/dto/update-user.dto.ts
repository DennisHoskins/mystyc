import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

// For updates, we omit firebaseUid (can't change) and roles (separate endpoint)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['firebaseUid', 'roles'] as const)
) {}