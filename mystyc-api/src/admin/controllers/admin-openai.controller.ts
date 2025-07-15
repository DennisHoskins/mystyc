import { Controller, UseGuards, Get} from '@nestjs/common';
import { RolesGuard } from '@/common/guards/roles.guard';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';

import { OpenAICoreService } from '@/openai/openai-core.service';
import { OpenAIUsage } from '@/common/interfaces/openai-usage.interface';
import { AdminController } from './admin.controller';
import { logger } from '@/common/util/logger';

@Controller('admin/openai')
export class AdminOpenAIController extends AdminController<OpenAIUsage> {
  protected serviceName = 'OpenAI';
  
  constructor(protected service: OpenAICoreService) {
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
        error: error.message
      }, 'OpenAIController');
      throw error;
    }
  }  
}