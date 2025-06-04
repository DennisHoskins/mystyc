import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

import { AppModule } from '@/app.module';
import { logger } from '@/util/logger';
import mongoose from 'mongoose';

async function bootstrap() {
  logger.info('Starting application bootstrap');

  // Don't log sensitive env vars in production
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Environment check', { mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET' });
  }

  const app = await NestFactory.create(AppModule);
  logger.info('NestJS application created');
  
  // Enable security headers
  app.use(helmet());
  logger.debug('Security headers enabled');
  
  // Cookie parser (required for CSRF)
  app.use(cookieParser());
  logger.debug('Cookie parser configured');
  
  // // CSRF protection - only in production same-origin setup
  // if (process.env.NODE_ENV === 'production') {
  //   app.use(csurf({ 
  //     cookie: {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'strict'
  //     }
  //   }));
  //   logger.debug('CSRF protection enabled');
  // } else {
  //   logger.debug('CSRF protection disabled for development');
  // }
  
  // Request size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
  app.use(express.raw({ limit: '10kb' }));
  app.use(express.text({ limit: '10kb' }));
  logger.debug('Request size limits configured');
  
  // Enable validation with transformation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
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
        throw new BadRequestException('Validation failed');
      }
    }
  }));
  logger.debug('Global validation pipe configured');
  
  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://mystyc.app', 
          'https://skull.international', 
          'https://skull.international:3000', 
          'http://skull.international:3000',
          'http://localhost:3000', 
          /^https:\/\/.*\.loca\.lt$/] 
      : [
          'http://localhost:3000',
          'http://localhost:3002', 
          /^https:\/\/.*\.loca\.lt$/
        ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-CSRF-Token',
  });
  logger.debug('CORS configured');
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.info('Application started successfully', { 
    port,
    environment: process.env.NODE_ENV || 'development' 
  });

  // MongoDB connection logging
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  });
}

bootstrap().catch(error => {
  logger.error('Application failed to start', { error: error.message, stack: error.stack });
  process.exit(1);
});
