import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(100) // Firebase ID tokens are usually long, set a reasonable minimum
  @MaxLength(2000) // Set a max length to prevent excessively large payloads
  idToken: string;
}