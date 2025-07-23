// Load environment variables from .env file before any other imports
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as express from 'express';
import { raw } from 'express';
import mongoose from 'mongoose';

import { logger } from '@/common/util/logger';
import { AppModule } from '@/app.module';

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

  // Add stripe webhook
  app.use('/api/stripe/webhook', raw({ type: 'application/json' }));

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
  
  // NOTE: Exception filters are now registered globally in app.module.ts via APP_FILTER providers
  // NOTE: Validation is now handled by Zod pipes at the controller level
  
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
  logger.error('Application failed to start', { error, stack: error.stack });
  process.exit(1);
});