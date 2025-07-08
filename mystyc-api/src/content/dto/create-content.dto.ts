import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUrl,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SanitizeText } from '@/common/decorators/sanitization.decorators';

export class DataItemDto {
  @IsString()
  @IsNotEmpty()
  @SanitizeText('key', { maxLength: 100 })
  key: string;

  @IsString()
  @IsNotEmpty()
  @SanitizeText('value', { maxLength: 500 })
  value: string;
}

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  @Transform(({ value }) => value?.trim())
  date: string;

  @IsString()
  @IsNotEmpty()
  @SanitizeText('title', { maxLength: 200 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @SanitizeText('message', { maxLength: 1000 })
  message: string;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link URL must be a valid URL' })
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @SanitizeText('linkText', { maxLength: 100 })
  linkText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataItemDto)
  data: DataItemDto[];

  @IsArray()
  @IsString({ each: true })
  sources: string[];

  @IsEnum(['generated', 'failed', 'fallback'])
  status: 'generated' | 'failed' | 'fallback';

  @IsOptional()
  @IsString()
  @SanitizeText('error', { maxLength: 500 })
  error?: string;

  @IsDateString()
  generatedAt: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10) || 0)
  generationDuration: number;
}
