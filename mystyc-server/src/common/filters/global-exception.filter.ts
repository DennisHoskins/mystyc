import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

import { logger } from '@/common/util/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let details: string | undefined;
    let errorCode: string | undefined;

    // Get user context safely (without exposing sensitive data)
    const userContext = {
      ip: this.getClientIp(request),
      userAgent: request.headers['user-agent']?.substring(0, 200), // Limit length
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString()
    };

    if (this.isHttpException(exception)) {
      // Known HTTP exceptions (validation errors, auth errors, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        
        // Handle validation errors specially
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          details = process.env.NODE_ENV === 'development' 
            ? responseObj.message.join(', ') 
            : undefined;
        }
      } else {
        message = typeof exceptionResponse === 'string' ? exceptionResponse : exception.message;
      }

      // Handle revoked token exceptions specifically
      if (status === 401 && message === 'Token revoked by admin') {
        errorCode = 'TOKEN_REVOKED';
        logger.security('Revoked token exception caught', {
          ...userContext,
          errorCode,
          message
        });
      }
      
      // Don't log expected client errors (4xx) as server errors
      if (status >= 500) {
        logger.error('HTTP Exception', {
          ...userContext,
          status,
          message: exception.message,
          stack: exception.stack
        }, 'GlobalExceptionFilter');
      } else if (status === 401 || status === 403) {
        // Log auth failures for security monitoring (but revoked tokens already logged above)
        if (errorCode !== 'TOKEN_REVOKED') {
          logger.security('Authentication/Authorization failure', {
            ...userContext,
            status,
            message
          });
        }
      }
    } else if (this.isMongooseValidationError(exception)) {
      // Mongoose validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      const validationErrors = Object.values(exception.errors).map(err => (err as any).message);
      details = process.env.NODE_ENV === 'development' ? validationErrors.join(', ') : undefined;
      
      logger.warn('Mongoose validation error', {
        ...userContext,
        validationErrors
      }, 'GlobalExceptionFilter');
    } else if (this.isMongoDuplicateKeyError(exception)) {
      // Duplicate key errors (unique constraint violations)
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry found';
      const duplicateField = this.extractDuplicateField(exception);
      details = process.env.NODE_ENV === 'development' 
        ? `${duplicateField} already exists` 
        : undefined;
      
      logger.warn('Duplicate key error', {
        ...userContext,
        field: duplicateField
      }, 'GlobalExceptionFilter');
    } else if (this.isMongoError(exception)) {
      // Other MongoDB errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      details = process.env.NODE_ENV === 'development' ? (exception as any).message : undefined;
      
      logger.error('MongoDB error', {
        ...userContext,
        error: (exception as any).message,
        code: (exception as any).code
      }, 'GlobalExceptionFilter');
    } else if (this.isError(exception)) {
      // Unexpected application errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = process.env.NODE_ENV === 'development' ? exception.message : undefined;
      
      logger.error('Unexpected error', {
        ...userContext,
        error: exception.message,
        stack: exception.stack
      }, 'GlobalExceptionFilter');
    } else {
      // Unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
      
      logger.error('Unknown error type', {
        ...userContext,
        error: String(exception)
      }, 'GlobalExceptionFilter');
    }

    // Sanitize the response - never expose internal details in production
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.sanitizeErrorMessage(message),
      ...(errorCode && { code: errorCode }),
      ...(details && process.env.NODE_ENV === 'development' && { details })
    };

    response.status(status).json(errorResponse);
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove any potentially sensitive information from error messages
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /key/gi,
      /secret/gi,
      /credential/gi
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }

  private isMongooseValidationError(exception: unknown): exception is MongooseError.ValidationError {
    return exception instanceof MongooseError.ValidationError;
  }

  private isMongoDuplicateKeyError(exception: unknown): exception is MongoError {
    return this.isMongoError(exception) && (exception as any).code === 11000;
  }

  private isMongoError(exception: unknown): exception is MongoError {
    return exception instanceof MongoError;
  }

  private isError(exception: unknown): exception is Error {
    return exception instanceof Error;
  }

  private extractDuplicateField(exception: MongoError): string {
    const message = (exception as any).message || '';
    // Extract field name from error message like: "E11000 duplicate key error collection: test.users index: email_1"
    const match = message.match(/index: (\w+)_/);
    return match ? match[1] : 'field';
  }
}