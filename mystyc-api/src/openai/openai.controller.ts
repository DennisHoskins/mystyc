import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { OpenAIService } from './openai.service';
import { logger } from '@/common/util/logger';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {}

  /**
   * Get current month's OpenAI usage and budget status (Admin only)
   */
  @Get('usage')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsage() {
    logger.info('Admin checking OpenAI usage', {}, 'OpenAIController');
    
    try {
      const usage = await this.openAIService.getMonthlyUsage();
      
      logger.info('OpenAI usage retrieved', {
        month: usage.month,
        totalCost: usage.totalCost,
        remainingBudget: usage.remainingBudget,
        budgetUsedPercent: usage.budgetUsedPercent
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