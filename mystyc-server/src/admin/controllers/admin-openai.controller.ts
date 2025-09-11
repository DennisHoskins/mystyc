import { Controller, UseGuards, Get } from '@nestjs/common';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants/roles.enum';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { OpenAIUsageService } from '@/openai/openai-usage.service';
import { AdminController } from './admin.controller';

@Controller('admin/openai')
export class AdminOpenAIController extends AdminController<OpenAIUsage> {
  protected serviceName = 'OpenAI';
  
  constructor(protected service: OpenAIUsageService) {
    super();
  }

  /**
   * Get current month's OpenAI usage and budget status (Admin only)
   */
  @Get('/usage')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsage() {
    logger.info('Admin checking OpenAI usage', {}, 'OpenAIController');
    
    try {
      const usage = await this.service.getUsageStats();
      
      logger.info('OpenAI usage retrieved', {
        month: usage.month,
        totalCost: usage.tokenBudget,
        totalCostPercent: usage.costUsagePercent,
        remainingBudget: usage.tokenBudget - usage.tokensUsed,
        budgetUsedPercent: usage.tokenUsagePercent
      }, 'OpenAIController');
      
      return usage;
    } catch (error) {
      logger.error('Failed to get OpenAI usage', {
        error
      }, 'OpenAIController');
      throw error;
    }
  }  
}