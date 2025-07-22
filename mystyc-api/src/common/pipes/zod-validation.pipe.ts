import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { logger } from '@/common/util/logger';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      );
      
      logger.warn('Zod validation failed', {
        type: metadata.type,
        errors: errorMessages,
      }, 'ZodValidationPipe');
      
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
        details: result.error.issues
      });
    }

    return result.data;
  }
}

export function createZodPipe(schema: z.ZodSchema) {
  return new ZodValidationPipe(schema);
}