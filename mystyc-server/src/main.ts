import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';

import { AppModule } from '@/app.module';
import { logger } from '@/util/logger';

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
  }));
  logger.debug('Global validation pipe configured');
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
    allowedHeaders: 'Content-Type,Authorization',
  });
  logger.debug('CORS configured');
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.info('Application started successfully', { 
    port,
    environment: process.env.NODE_ENV || 'development' 
  });
}

bootstrap().catch(error => {
  logger.error('Application failed to start', { error: error.message, stack: error.stack });
  process.exit(1);
});