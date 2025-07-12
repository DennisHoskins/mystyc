import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/public.decorator';
import { WebsiteContentService } from './website-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Controller('content')
export class ContentController {
  constructor(private readonly websiteContentService: WebsiteContentService) {}

  /**
   * Get today's content
   */
  @Get('today')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(): Promise<Content> {
    logger.info('Fetching today\'s website content', {}, 'ContentController');

    try {
      const content = await this.websiteContentService.getTodaysWebsiteContent();
      
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