// Load environment variables from .env file before any other imports
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import mongoose from 'mongoose';

import { AppModule } from '@/app.module';
import { logger } from '@/common/util/logger';

/**
 * Bootstrap function to initialize and configure the NestJS application
 * Sets up security, validation, CORS, request limits, and database connections
 */
async function bootstrap() {
  logger.info('Starting application bootstrap');

  // Don't leak sensitive env vars in production
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Environment check', { mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET' });
  }

  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);
  logger.info('NestJS application created');

  // MongoDB connection event handlers for monitoring
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  });

  // Configure Cross-Origin Resource Sharing (CORS)
  // Allow specific origins based on environment
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://mystyc.app', 
          'https://mystyc-client.loca.lt',
        ] 
      : [
          'https://mystyc-client.loca.lt',
        ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-CSRF-Token',
  });
  logger.debug('CORS configured');
  
  // Enable security middleware (helmet) for HTTP headers protection
  app.use(helmet());
  logger.debug('Security headers enabled');
  
  // Set request payload size limits to prevent DoS attacks
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
  app.use(express.raw({ limit: '10kb' }));
  app.use(express.text({ limit: '10kb' }));
  logger.debug('Request size limits configured');
  
  // Configure global validation pipe with transformation and detailed error handling
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transform incoming payloads to match DTO types
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    exceptionFactory: (errors) => {
      // Provide detailed validation errors in development, generic in production
      if (process.env.NODE_ENV === 'development') {
        const messages = errors.map(error => {
          const constraints = error.constraints;
          const property = error.property;
          const value = error.value;
          
          logger.info(`Validation failed for property: ${property}, value: ${value}, constraints:`, constraints);
          
          return {
            property,
            value,
            constraints: constraints ? Object.values(constraints) : ['Unknown validation error']
          };
        });
        
        logger.info('Full validation errors:', messages);
        
        throw new BadRequestException({
          message: 'Validation failed',
          details: messages
        });
      } else {
        // Hide implementation details in production
        throw new BadRequestException('Validation failed');
      }
    }
  }));
  logger.debug('Global validation pipe configured');
  
  // Set global API prefix for all routes
  app.setGlobalPrefix('api');
  
  // Start the server on specified port
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.info('Application started successfully', { 
    port,
    environment: process.env.NODE_ENV || 'development' 
  });
}

// Start the application and handle any startup errors
bootstrap().catch(error => {
  logger.error('Application failed to start', { error: error.message, stack: error.stack });
  process.exit(1);
});