import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenAIRequestDocument } from '@/openai/schemas/openai-request.schema';
import { OpenAICoreService } from '@/openai/openai-core.service';
import { 
  OpenAIRequestSummaryStats
} from '@/common/interfaces/admin/stats/admin-openai-request-stats.interface';
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
    @InjectModel('OpenAIRequest') private openAIRequestModel: Model<OpenAIRequestDocument>,
    private readonly openAIService: OpenAICoreService,
  ) {}

  async getSummaryStats(query?: AdminStatsQueryDto): Promise<OpenAIRequestSummaryStats> {
    logger.info('Generating openai summary stats', { query }, 'AdminOpenAIStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      const pipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalTokens: { $sum: '$tokensUsed' },
            totalCost: { $sum: '$cost' },
            successfulRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            successRate: {
              $cond: [
                { $gt: ['$totalRequests', 0] },
                { $round: [{ $multiply: [{ $divide: ['$successfulRequests', '$totalRequests'] }, 100] }] },
                0
              ]
            },
            averageTokensPerRequest: {
              $cond: [
                { $gt: ['$totalRequests', 0] },
                { $round: [{ $divide: ['$totalTokens', '$totalRequests'] }] },
                0
              ]
            },
            averageCostPerRequest: {
              $cond: [
                { $gt: ['$totalRequests', 0] },
                { $round: [{ $divide: ['$totalCost', '$totalRequests'] }, 4] },
                0
              ]
            }
          }
        }
      ];

      const [result] = await this.openAIRequestModel.aggregate(pipeline);

      if (!result) {
        return {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          successRate: 0,
          totalTokens: 0,
          totalCost: 0,
          averageTokensPerRequest: 0,
          averageCostPerRequest: 0
        };
      }

      logger.info('OpenAI summary stats generated', {
        totalRequests: result.totalRequests,
        successRate: result.successRate,
        totalCost: result.totalCost
      }, 'AdminOpenAIStatsService');

      return {
        totalRequests: result.totalRequests,
        successfulRequests: result.successfulRequests,
        failedRequests: result.failedRequests,
        successRate: result.successRate,
        totalTokens: result.totalTokens || 0,
        totalCost: result.totalCost || 0,
        averageTokensPerRequest: result.averageTokensPerRequest,
        averageCostPerRequest: result.averageCostPerRequest
      };

    } catch (error) {
      logger.error('Failed to generate openai summary stats', {
        error: error.message,
        query
      }, 'AdminOpenAIStatsService');

      // Return default values if aggregation fails
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        totalTokens: 0,
        totalCost: 0,
        averageTokensPerRequest: 0,
        averageCostPerRequest: 0
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