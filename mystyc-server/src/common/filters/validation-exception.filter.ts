import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ValidationError } from 'mystyc-common/util/validation';

import { logger } from '@/common/util/logger';

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    logger.warn('Validation error caught', {
      path: request.url,
      method: request.method,
      errors: exception.errors,
    }, 'ValidationExceptionFilter');

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Validation failed',
      errors: exception.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code
      }))
    });
  }
}