import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { UserContentService } from './user-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Controller('user-content')
export class UserContentController {
  constructor(
    private readonly userContentService: UserContentService,
  ) {}

  /**
   * Get today's content
   */
  @Get('today')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getTodaysContent(@FirebaseUser() firebaseUserFromDecorator): Promise<Content> {
    logger.info('Fetching today\'s user content', {}, 'ContentController');

    try {
      const content = await this.userContentService.getTodaysUserContent(firebaseUserFromDecorator.uid);
      
      logger.info('Today\'s user content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get today\'s user content', {
        error: error.message
      }, 'ContentController');
      throw error;
    }
  }

  /**
   * Get content for a specific date
   */
  @Get(':date')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getContentByDate(
    @FirebaseUser() firebaseUserFromDecorator,
    @Param('date') date: string
  ): Promise<Content> {
    logger.info('Fetching user content by date', { date }, 'ContentController');

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    try {
      const content = await this.userContentService.getOrGenerateUserContent(firebaseUserFromDecorator.uid, date);
      
      logger.info('Website content retrieved', {
        date: content.date,
        status: content.status
      }, 'ContentController');

      return content;
    } catch (error) {
      logger.error('Failed to get user content', {
        date,
        error: error.message
      }, 'ContentController');
      throw error;
    }
  }
}