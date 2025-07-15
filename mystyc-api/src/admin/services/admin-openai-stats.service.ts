import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenAIUsageDocument } from '@/openai/schemas/openai-usage.schema';
import { OpenAICoreService } from '@/openai/openai-core.service';
import { 
  OpenAIUsageSummaryStats
} from '@/common/interfaces/admin/stats/admin-openai-usage-stats.interface';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';
import { logger } from '@/common/util/logger';

@RegisterStatsModule({
  serviceName: 'OpenAI',
  service: AdminOpenAIStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' }
  ]
})
@Injectable()
export class AdminOpenAIStatsService {
  constructor(
    @InjectModel('OpenAIUsage') private openAIUsageModel: Model<OpenAIUsageDocument>,
    private readonly openAIService: OpenAICoreService,
  ) {}

  async getSummaryStats(query?: AdminStatsQueryDto): Promise<OpenAIUsageSummaryStats> {
    logger.info('Generating openai summary stats', { query }, 'AdminOpenAIStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      const pipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
      ];

      const [result] = await this.openAIUsageModel.aggregate(pipeline);

      if (!result) {
        return {
          totalUsage: 0,
        };
      }

      logger.info('OpenAI summary stats generated', {
        totalUsage: result.totalUsage,
      }, 'AdminOpenAIStatsService');

      return {
        totalUsage: result.totalUsage,
      };

    } catch (error) {
      logger.error('Failed to generate openai summary stats', {
        error: error.message,
        query
      }, 'AdminOpenAIStatsService');

      // Return default values if aggregation fails
      return {
        totalUsage: 0,
      };
    }
  }

  private buildDateFilter(query?: AdminStatsQueryDto): any {
    if (!query?.startDate && !query?.endDate) return null;
    
    const filter: any = {};
    if (query.startDate) filter.$gte = new Date(query.startDate);
    if (query.endDate) filter.$lte = new Date(query.endDate);
    
    return Object.keys(filter).length > 0 ? filter : null;
  }
}