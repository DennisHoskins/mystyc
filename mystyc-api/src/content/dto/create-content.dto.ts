import { IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
  // Prompt
  @IsOptional()
  @IsString({ message: 'Prompt must be a string' })
  prompt?: string;
}