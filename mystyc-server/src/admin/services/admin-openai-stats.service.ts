import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  OpenAIUsageSummaryStats,
  OpenAIMonthlyUsageStats,
  OpenAIContentTypeUsageStats
} from 'mystyc-common/admin/interfaces/stats/admin-openai-usage-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { OpenAIUsageDocument } from '@/openai/schemas/openai-usage.schema';
import { OpenAIUsageService } from '@/openai/openai-usage.service';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'OpenAI',
  service: AdminOpenAIStatsService,
  stats: [
    { key: 'currentMonthlyUsage', method: 'getCurrentMonthlyUsageStats' },
    { key: 'usageSummary', method: 'getSummaryStats' },
    { key: 'monthlyUsage', method: 'getMonthlyUsageStats' },
    { key: 'contentTypeUsage', method: 'getContentTypeUsageStats' }
  ]
})
@Injectable()
export class AdminOpenAIStatsService {
  constructor(
    @InjectModel('OpenAIUsage') private openAIUsageModel: Model<OpenAIUsageDocument>,
    private readonly openAIUsageService: OpenAIUsageService,
  ) {}

  async getCurrentMonthlyUsageStats() {
    return await this.openAIUsageService.getUsageStats();
  }

  async getSummaryStats(query?: AdminStatsQuery): Promise<OpenAIUsageSummaryStats> {
    logger.info('Generating OpenAI summary stats', { query }, 'AdminOpenAIStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      // Get current usage from OpenAI usage tracking
      const currentUsage = await this.openAIUsageService.getUsageStats();
      
      // Get content generation stats
      const contentPipeline: any[] = [
        {
          $match: {
            openAIData: { $exists: true },
            ...(dateFilter ? { createdAt: dateFilter } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: { $sum: '$openAIData.cost' },
            totalInputTokens: { $sum: '$openAIData.inputTokens' },
            totalOutputTokens: { $sum: '$openAIData.outputTokens' },
            averageCostPerRequest: { $avg: '$openAIData.cost' },
            averageTokensPerRequest: { 
              $avg: { $add: ['$openAIData.inputTokens', '$openAIData.outputTokens'] }
            }
          }
        }
      ];

      return {
        currentMonth: {
          month: currentUsage.month,
          totalRequests: currentUsage.totalRequests,
          costUsed: currentUsage.costUsed,
          costBudget: currentUsage.costBudget,
          costRemaining: Math.max(0, currentUsage.costBudget - currentUsage.costUsed),
          costUsagePercent: currentUsage.costUsagePercent,
          tokensUsed: currentUsage.tokensUsed,
          tokenBudget: currentUsage.tokenBudget,
          tokensRemaining: Math.max(0, currentUsage.tokenBudget - currentUsage.tokensUsed),
          tokenUsagePercent: currentUsage.tokenUsagePercent
        },
        totalRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        averageCostPerRequest: 0,
        averageTokensPerRequest: 0
      };

      // const totalTokens = (contentResult.totalInputTokens || 0) + (contentResult.totalOutputTokens || 0);

      // logger.info('OpenAI summary stats generated', {
      //   totalRequests: contentResult.totalRequests,
      //   totalCost: contentResult.totalCost,
      //   currentMonthUsage: currentUsage.costUsagePercent
      // }, 'AdminOpenAIStatsService');

      // return {
      //   currentMonth: {
      //     month: currentUsage.month,
      //     totalRequests: currentUsage.totalRequests,
      //     costUsed: currentUsage.costUsed,
      //     costBudget: currentUsage.costBudget,
      //     costRemaining: Math.max(0, currentUsage.costBudget - currentUsage.costUsed),
      //     costUsagePercent: currentUsage.costUsagePercent,
      //     tokensUsed: currentUsage.tokensUsed,
      //     tokenBudget: currentUsage.tokenBudget,
      //     tokensRemaining: Math.max(0, currentUsage.tokenBudget - currentUsage.tokensUsed),
      //     tokenUsagePercent: currentUsage.costUsagePercent
      //   },
      //   totalRequests: contentResult.totalRequests,
      //   totalCost: Math.round(contentResult.totalCost * 100) / 100,
      //   totalTokens,
      //   averageCostPerRequest: Math.round((contentResult.averageCostPerRequest || 0) * 10000) / 10000,
      //   averageTokensPerRequest: Math.round(contentResult.averageTokensPerRequest || 0)
      // };

    } catch (error) {
      logger.error('Failed to generate OpenAI summary stats', {
        error,
        query
      }, 'AdminOpenAIStatsService');
      throw error;
    }
  }

  async getMonthlyUsageStats(query?: AdminStatsQuery): Promise<OpenAIMonthlyUsageStats> {
    logger.info('Generating OpenAI monthly usage stats', { query }, 'AdminOpenAIStatsService');
    
    try {
      // const { limit = 12 } = query || {}; // Default to last 12 months
      
      // // Get monthly breakdown from content
      // const monthlyPipeline: any[] = [
      //   {
      //     $match: {
      //       openAIData: { $exists: true }
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         $dateToString: { format: "%Y-%m", date: "$createdAt" }
      //       },
      //       requests: { $sum: 1 },
      //       cost: { $sum: '$openAIData.cost' },
      //       inputTokens: { $sum: '$openAIData.inputTokens' },
      //       outputTokens: { $sum: '$openAIData.outputTokens' },
      //       retries: { $sum: '$openAIData.retryCount' }
      //     }
      //   },
      //   {
      //     $addFields: {
      //       totalTokens: { $add: ['$inputTokens', '$outputTokens'] },
      //       averageCostPerRequest: {
      //         $cond: [
      //           { $gt: ['$requests', 0] },
      //           { $divide: ['$cost', '$requests'] },
      //           0
      //         ]
      //       }
      //     }
      //   },
      //   { $sort: { _id: -1 } },
      //   { $limit: limit }
      // ];

      // // const monthlyResults = await this.contentModel.aggregate(monthlyPipeline);

      // // Get budget tracking data from OpenAI usage collection
      // const budgetPipeline: any[] = [
      //   { $sort: { month: -1 } },
      //   { $limit: limit },
      //   {
      //     $project: {
      //       month: 1,
      //       costBudget: 1,
      //       tokenBudget: 1,
      //       costUsed: 1,
      //       tokensUsed: 1,
      //       totalRequests: 1
      //     }
      //   }
      // ];

      // const budgetResults = await this.openAIUsageModel.aggregate(budgetPipeline);
      // const budgetMap = new Map(budgetResults.map(b => [b.month, b]));

      // // Combine content stats with budget data
      // const monthlyUsage = monthlyResults.map(month => {
      //   const budget = budgetMap.get(month._id) || {
      //     costBudget: 10.00, // Default budget
      //     tokenBudget: 500000,
      //     costUsed: month.cost,
      //     tokensUsed: month.totalTokens,
      //     totalRequests: month.requests
      //   };

      //   return {
      //     month: month._id,
      //     requests: budget.totalRequests || month.requests,
      //     cost: Math.round(month.cost * 100) / 100,
      //     totalTokens: month.totalTokens,
      //     inputTokens: month.inputTokens,
      //     outputTokens: month.outputTokens,
      //     retries: month.retries,
      //     averageCostPerRequest: Math.round((month.averageCostPerRequest || 0) * 10000) / 10000,
      //     budgetUsed: Math.round((month.cost / budget.costBudget) * 100),
      //     budgetRemaining: Math.max(0, budget.costBudget - month.cost)
      //   };
      // }).reverse(); // Oldest to newest

      // logger.info('OpenAI monthly usage stats generated', {
      //   monthsAnalyzed: monthlyUsage.length,
      //   totalRequests: monthlyUsage.reduce((sum, m) => sum + m.requests, 0)
      // }, 'AdminOpenAIStatsService');

      // return {
      //   monthlyUsage
      // };

      return {
        monthlyUsage: [{
          month: "May",
          requests: 1,
          cost: 1,
          totalTokens: 1,
          inputTokens: 1,
          outputTokens: 1,
          retries: 0,
          averageCostPerRequest: 1,
          budgetUsed: 0.1,
          budgetRemaining: 1
        }]
      };
    } catch (error) {
      logger.error('Failed to generate OpenAI monthly usage stats', {
        error,
        query
      }, 'AdminOpenAIStatsService');
      throw error;
    }
  }

  async getContentTypeUsageStats(query?: AdminStatsQuery): Promise<OpenAIContentTypeUsageStats> {
    logger.info('Generating OpenAI content type usage stats', { query }, 'AdminOpenAIStatsService');
    
    try {
      // const dateFilter = this.buildDateFilter(query);
      
      // const pipeline: any[] = [
      //   {
      //     $match: {
      //       openAIData: { $exists: true },
      //       ...(dateFilter ? { createdAt: dateFilter } : {})
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: '$type',
      //       requests: { $sum: '$openAIData.totalRequests'  },
      //       cost: { $sum: '$openAIData.cost' },
      //       inputTokens: { $sum: '$openAIData.inputTokens' },
      //       outputTokens: { $sum: '$openAIData.outputTokens' },
      //       retries: { $sum: '$openAIData.retryCount' },
      //       averageGenerationTime: { $avg: '$generationDuration' }
      //     }
      //   },
      //   {
      //     $addFields: {
      //       totalTokens: { $add: ['$inputTokens', '$outputTokens'] },
      //       averageCostPerRequest: {
      //         $cond: [
      //           { $gt: ['$requests', 0] },  // <- Check if requests > 0
      //           { $divide: ['$cost', '$requests'] },
      //           0  // <- Default to 0 if no requests
      //         ]
      //       }
      //     }
      //   },
      //   { $sort: { cost: -1 } }
      // ];

      // const results = await this.contentModel.aggregate(pipeline);
      // const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

      // const usageByContentType = results.map(result => ({
      //   contentType: result._id,
      //   requests: result.requests,
      //   cost: Math.round(result.cost * 100) / 100,
      //   costPercentage: totalCost > 0 ? Math.round((result.cost / totalCost) * 100) : 0,
      //   totalTokens: result.totalTokens,
      //   inputTokens: result.inputTokens,
      //   outputTokens: result.outputTokens,
      //   retries: result.retries,
      //   averageCostPerRequest: Math.round((result.averageCostPerRequest || 0) * 10000) / 10000,
      //   averageGenerationTime: Math.round(result.averageGenerationTime || 0)
      // }));

      // logger.info('OpenAI content type usage stats generated', {
      //   contentTypes: usageByContentType.length,
      //   totalCost: Math.round(totalCost * 100) / 100
      // }, 'AdminOpenAIStatsService');

      // return {
      //   totalCost: Math.round(totalCost * 100) / 100,
      //   usageByContentType
      // };

      return {
        totalCost: 0.1,
        usageByContentType: []
      }
    } catch (error) {
      logger.error('Failed to generate OpenAI content type usage stats', {
        error,
        query
      }, 'AdminOpenAIStatsService');
      throw error;
    }
  }

  private buildDateFilter(query?: AdminStatsQuery): any {
    if (!query?.startDate && !query?.endDate) return null;
    
    const filter: any = {};
    if (query.startDate) {
      filter.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.$lte = endDate;
    }
    
    return Object.keys(filter).length > 0 ? filter : null;
  }
}