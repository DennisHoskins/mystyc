import { IsOptional, IsString } from 'class-validator';
import { ValidateClientTimestamp } from '@/common/decorators/validation.decorators';

export class CreateContentDto {
  // Prompt
  @IsOptional()
  @IsString({ message: 'Prompt must be a string' })
  prompt?: string;

  @IsOptional()
  @ValidateClientTimestamp()
  clientTimestamp: string;
}