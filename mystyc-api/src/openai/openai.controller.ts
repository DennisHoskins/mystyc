import { Controller, UseGuards, Get, Post, Body } from '@nestjs/common';
import { RolesGuard } from '@/common/guards/roles.guard';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { OpenAICoreService } from './openai-core.service';
import { OpenAIWebsiteService } from './openai-website.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIContextDto } from './dto/openai-context.dto';
import { logger } from '@/common/util/logger';

@Controller('openai')
export class OpenAIController {
  constructor(
    private core: OpenAICoreService,
    private website: OpenAIWebsiteService,
    private user: OpenAIUserService,
  ) {}

  @Post('website')
  generateWebsite(@Body() dto: { date: string; context?: OpenAIContextDto }) {
    return this.website.generateWebsiteContent(dto.date, dto.context);
  }

  @Post('user')
  generateUser(@Body() dto: { userId: string; date: string; context?: OpenAIContextDto }) {
    return this.user.generateUserContent(dto.userId, dto.date, dto.context);
  }
  
  /**
   * Get current month's OpenAI usage and budget status (Admin only)
   */
  @Get('usage')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsage() {
    logger.info('Admin checking OpenAI usage', {}, 'OpenAIController');
    
    try {
      const usage = await this.core.getUsageStats();
      
      logger.info('OpenAI usage retrieved', {
        month: usage.month,
        totalCost: usage.tokenBudget,
        remainingBudget: usage.tokenBudget - usage.tokensUsed,
        budgetUsedPercent: usage.tokenUsagePercent
      }, 'OpenAIController');
      
      return usage;
    } catch (error) {
      logger.error('Failed to get OpenAI usage', {
        error: error.message
      }, 'OpenAIController');
      throw error;
    }
  }
}