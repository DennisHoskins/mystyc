import { ValidateFirebaseToken } from '@/common/decorators/validation.decorators';

export class VerifyTokenDto {
  @ValidateFirebaseToken()
  idToken: string;
}