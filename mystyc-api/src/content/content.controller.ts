import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/public.decorator';
import { ContentService } from './content.service';
import { Content } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * Get today's content
   */
  @Get('today')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(): Promise<Content> {
    logger.info('Fetching today\'s content', {}, 'ContentController');

    try {
      const content = await this.contentService.getTodaysContent();
      
      logger.info('Today\'s content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s content', {
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
    logger.info('Fetching content by date', { date }, 'ContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.contentService.getOrGenerateContent(date);
      
      logger.info('Content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get content', {
        date,
        error: error.message
      }, 'ContentController');
      throw error;
    }
  }
}