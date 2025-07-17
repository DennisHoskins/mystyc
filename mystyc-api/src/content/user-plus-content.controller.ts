import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { SubscriptionLevelGuard } from '@/common/guards/subscription-level.guard';
import { RequireSubscriptionLevels } from '@/common/decorators/subscription-levels.decorator';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';
import { FirebaseUser } from '@/common/decorators/user.decorator';
import { UserPlusContentService } from './user-plus-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Controller('plus-content')
export class UserPlusContentController {
  constructor(
    private readonly userPlusContentService: UserPlusContentService,
  ) {}

  /**
   * Get today's plus content
   */
  @Post('today')
  @UseGuards(FirebaseAuthGuard, SubscriptionLevelGuard)
  @RequireSubscriptionLevels(SubscriptionLevel.PLUS, SubscriptionLevel.PRO)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysPlusContent(
    @FirebaseUser() firebaseUserFromDecorator,
    @Body() body: { deviceInfo?: any }
  ): Promise<Content> {
    logger.info('Fetching today\'s plus content', { 
      uid: firebaseUserFromDecorator.uid 
    }, 'UserPlusContentController');

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
        return this.userPlusContentService.getOrGeneratePlusContent(firebaseUserFromDecorator.uid, yesterdayDate);
      }      
      
      // Return today's content in user's timezone
      const content = await this.userPlusContentService.getOrGeneratePlusContent(firebaseUserFromDecorator.uid, userLocalDate);
      
      logger.info('Today\'s plus content retrieved', {
        uid: firebaseUserFromDecorator.uid,
        date: content.date,
        status: content.status
      }, 'UserPlusContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s plus content', {
        uid: firebaseUserFromDecorator.uid,
        error: error.message
      }, 'UserPlusContentController');
      throw error;
    }
  }

  /**
   * Get plus content for a specific date
   */
  @Get(':date')
  @UseGuards(FirebaseAuthGuard, SubscriptionLevelGuard)
  @RequireSubscriptionLevels(SubscriptionLevel.PLUS, SubscriptionLevel.PRO)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getPlusContentByDate(
    @FirebaseUser() firebaseUserFromDecorator,
    @Param('date') date: string
  ): Promise<Content> {
    logger.info('Fetching plus content by date', { 
      uid: firebaseUserFromDecorator.uid,
      date 
    }, 'UserPlusContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.userPlusContentService.getOrGeneratePlusContent(
        firebaseUserFromDecorator.uid, 
        date
      );
      
      logger.info('Plus content retrieved', {
        uid: firebaseUserFromDecorator.uid,
        date: content.date,
        status: content.status
      }, 'UserPlusContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get plus content', {
        uid: firebaseUserFromDecorator.uid,
        date,
        error: error.message
      }, 'UserPlusContentController');
      throw error;
    }
  }
}