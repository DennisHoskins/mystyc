import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

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
  
  // Cookie parser (required for CSRF)
  app.use(cookieParser());
  logger.debug('Cookie parser configured');
  
  // CSRF protection - only in production same-origin setup
  if (process.env.NODE_ENV === 'production') {
    app.use(csurf({ 
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      }
    }));
    logger.debug('CSRF protection enabled');
  } else {
    logger.debug('CSRF protection disabled for development');
  }
  
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
    origin: [
      'http://localhost:3000',        // Development
      'https://mystyc.app',           // Production same-origin
      /^https:\/\/.*\.loca\.lt$/      // Localtunnel
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
}

bootstrap().catch(error => {
  logger.error('Application failed to start', { error: error.message, stack: error.stack });
  process.exit(1);
});