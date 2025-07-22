import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { UserContentService } from './user-content.service';
import { FirebaseUser as FirebaseUserInterface } from 'mystyc-common/schemas/';
import { Content } from 'mystyc-common/schemas';
import { logger } from '@/common/util/logger';

@Controller('user-content')
export class UserContentController {
  constructor(
    private readonly userContentService: UserContentService,
  ) {}

  /**
   * Get today's content (smart routing based on subscription level)
   * - FREE users: shared daily content
   * - PLUS users: personalized daily content  
   * - PRO users: personalized daily content (enhanced in future)
   */
  @Post('today')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface,
    @Body() body: { deviceInfo?: any }
  ): Promise<Content> {
    logger.info('Fetching today\'s user content with smart routing', {
      uid: firebaseUserFromDecorator.uid
    }, 'UserContentController');

    try{
      const timezone = body.deviceInfo?.timezone || 'UTC';
      
      const now = new Date();
      const localTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
      const hour = localTime.getHours();
      
      // Calculate user's local date (YYYY-MM-DD)
      const userLocalDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
      
      if (hour < 6) {
        // Return yesterday's content in user's timezone
        const yesterday = new Date(userLocalDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        return this.userContentService.getOrGenerateUserContent(firebaseUserFromDecorator.uid, yesterdayDate);
      }      
      
      // Return today's content in user's timezone
      const content = await this.userContentService.getOrGenerateUserContent(firebaseUserFromDecorator.uid, userLocalDate);
      
      logger.info('Today\'s user content retrieved via smart routing', {
        uid: firebaseUserFromDecorator.uid,
        date: content.date,
        status: content.status,
        contentType: content.type
      }, 'UserContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s user content', {
        uid: firebaseUserFromDecorator.uid,
        error
      }, 'UserContentController');
      throw error;
    }
  }

  /**
   * Get content for a specific date (smart routing based on subscription level)
   * - FREE users: shared daily content for that date
   * - PLUS users: personalized daily content for that date
   * - PRO users: personalized daily content for that date (enhanced in future)
   */
  @Get(':date')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getContentByDate(
    @FirebaseUser() firebaseUserFromDecorator: FirebaseUserInterface,
    @Param('date') date: string
  ): Promise<Content> {
    logger.info('Fetching user content by date with smart routing', { 
      uid: firebaseUserFromDecorator.uid,
      date 
    }, 'UserContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.userContentService.getOrGenerateUserContent(
        firebaseUserFromDecorator.uid, 
        date
      );
      
      logger.info('User content retrieved via smart routing', {
        uid: firebaseUserFromDecorator.uid,
        date: content.date,
        status: content.status,
        contentType: content.type
      }, 'UserContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get user content', {
        uid: firebaseUserFromDecorator.uid,
        date,
        error
      }, 'UserContentController');
      throw error;
    }
  }
}