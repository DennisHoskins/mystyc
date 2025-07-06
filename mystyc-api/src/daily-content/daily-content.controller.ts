import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/public.decorator';
import { DailyContentService } from './daily-content.service';
import { DailyContent } from '@/common/interfaces/dailyContent.interface';
import { logger } from '@/common/util/logger';

@Controller('daily-content')
export class DailyContentController {
  constructor(private readonly dailyContentService: DailyContentService) {}

  /**
   * Get today's daily content
   */
  @Get('today')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(): Promise<DailyContent> {
    logger.info('Fetching today\'s content', {}, 'DailyContentController');

    try {
      const content = await this.dailyContentService.getTodaysContent();
      
      logger.info('Today\'s content retrieved', {
        date: content.date,
        status: content.status
      }, 'DailyContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s content', {
        error: error.message
      }, 'DailyContentController');
      throw error;
    }
  }

  /**
   * Get content for a specific date
   */
  @Get(':date')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getContentByDate(@Param('date') date: string): Promise<DailyContent> {
    logger.info('Fetching content by date', { date }, 'DailyContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.dailyContentService.getOrGenerateContent(date);
      
      logger.info('Content retrieved', {
        date: content.date,
        status: content.status
      }, 'DailyContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get content', {
        date,
        error: error.message
      }, 'DailyContentController');
      throw error;
    }
  }
}