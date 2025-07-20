import { IsString, MinLength } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @MinLength(100)  // Basic length check for JWT
  idToken!: string;
}