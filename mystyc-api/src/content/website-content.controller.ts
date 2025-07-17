import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/public.decorator';
import { WebsiteContentService } from './website-content.service';
import { UserContentService } from './user-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Controller('website-content')
export class WebsiteContentController {
  constructor(
    private readonly websiteContentService: WebsiteContentService,
    private readonly userContentService: UserContentService,
  ) {}

  /**
   * Get today's content
   */
  @Post('today')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(@Body() body: { deviceInfo?: any }): Promise<Content> {

    try {
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
        return this.websiteContentService.getOrGenerateWebsiteContent(yesterdayDate);
      }      
      
      // Return today's content in user's timezone
      const content = await this.websiteContentService.getOrGenerateWebsiteContent(userLocalDate);

      logger.info('Today\'s website content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s website content', {
        error: error.message
      }, 'ContentController');
      throw error;
    }
  }

  /**
   * Get content for a specific date
   */
  @Get(':date')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getContentByDate(@Param('date') date: string): Promise<Content> {
    logger.info('Fetching website content by date', { date }, 'ContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.websiteContentService.getOrGenerateWebsiteContent(date);
      
      logger.info('Website content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get website content', {
        date,
        error: error.message
      }, 'ContentController');
      throw error;
    }
  }
}