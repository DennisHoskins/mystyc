import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentDocument } from '@/content/schemas/content.schema';
import { ContentService } from '@/content/content.service';
import { 
  ContentSummaryStats,
  ContentGenerationStats,
  ContentSourceStats,
  ContentTimelineStats
} from '@/common/interfaces/admin/adminContentStats.interface';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 
import { logger } from '@/common/util/logger';

@Injectable()
export class AdminContentStatsService {
  constructor(
    @InjectModel('Content') private contentModel: Model<ContentDocument>,
    private readonly contentService: ContentService,
  ) {}

  async getSummaryStats(query?: AdminStatsQueryDto): Promise<ContentSummaryStats> {
    logger.info('Generating content summary stats', { query }, 'AdminContentStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      // Get counts by status and generation times
      const pipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            generatedContent: {
              $sum: { $cond: [{ $eq: ['$status', 'generated'] }, 1, 0] }
            },
            failedContent: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            totalGenerationTime: {
              $sum: { $cond: [{ $eq: ['$status', 'generated'] }, '$generationDuration', 0] }
            },
            uniqueDates: { $addToSet: '$date' }
          }
        },
        {
          $addFields: {
            successRate: {
              $cond: [
                { $gt: ['$totalContent', 0] },
                { $round: [{ $multiply: [{ $divide: ['$generatedContent', '$totalContent'] }, 100] }, 2] },
                0
              ]
            },
            averageGenerationTime: {
              $cond: [
                { $gt: ['$generatedContent', 0] },
                { $round: [{ $divide: ['$totalGenerationTime', '$generatedContent'] }, 0] },
                0
              ]
            },
            daysWithContent: { $size: '$uniqueDates' }
          }
        }
      ];

      const [result] = await this.contentModel.aggregate(pipeline);

      if (!result) {
        return {
          totalContent: 0,
          generatedContent: 0,
          failedContent: 0,
          successRate: 0,
          averageGenerationTime: 0,
          dateRangeInDays: 0,
          coverageRate: 0
        };
      }

      // Calculate date range and coverage
      let dateRangeInDays = 0;
      let coverageRate = 0;
      
      if (query?.startDate && query?.endDate) {
        const start = new Date(query.startDate);
        const end = new Date(query.endDate);
        dateRangeInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        coverageRate = Math.round((result.daysWithContent / dateRangeInDays) * 100);
      }

      logger.info(' content summary stats generated', {
        totalContent: result.totalContent,
        successRate: result.successRate
      }, 'AdminContentStatsService');

      return {
        totalContent: result.totalContent,
        generatedContent: result.generatedContent,
        failedContent: result.failedContent,
        successRate: result.successRate,
        averageGenerationTime: result.averageGenerationTime,
        dateRangeInDays,
        coverageRate
      };
    } catch (error) {
      logger.error('Failed to generate content summary stats', {
        error: error.message,
        query
      }, 'AdminContentStatsService');
      throw error;
    }
  }

  async getGenerationStats(query?: AdminStatsQueryDto): Promise<ContentGenerationStats> {
    logger.info('Generating content generation stats', { query }, 'AdminContentStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      // Status breakdown
      const statusPipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: '$count' },
            statuses: {
              $push: {
                status: '$_id',
                count: '$count'
              }
            }
          }
        }
      ];

      // Generation time distribution
      const timePipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter, status: 'generated' } }] : []),
        {
          $bucket: {
            groupBy: '$generationDuration',
            boundaries: [0, 100, 500, 1000, 5000, 10000], // milliseconds
            default: '10000+',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ];

      // Failure reasons
      const failurePipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter, status: 'failed' } }] : []),
        {
          $group: {
            _id: { $substr: ['$error', 0, 50] }, // First 50 chars of error
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ];

      const [statusResult, timeResults, failureResults] = await Promise.all([
        this.contentModel.aggregate(statusPipeline),
        this.contentModel.aggregate(timePipeline),
        this.contentModel.aggregate(failurePipeline)
      ]);

      const totalAttempts = statusResult[0]?.totalAttempts || 0;
      
      // Format status breakdown
      const generationsByStatus = (statusResult[0]?.statuses || []).map(s => ({
        status: s.status,
        count: s.count,
        percentage: totalAttempts > 0 ? Math.round((s.count / totalAttempts) * 100) : 0
      }));

      // Format time distribution
      const timeRanges = [
        { min: 0, max: 100, label: '< 100ms' },
        { min: 100, max: 500, label: '100-500ms' },
        { min: 500, max: 1000, label: '500ms-1s' },
        { min: 1000, max: 5000, label: '1-5s' },
        { min: 5000, max: 10000, label: '5-10s' },
        { min: 10000, max: Infinity, label: '> 10s' }
      ];

      const generationTimeDistribution = timeRanges.map(range => {
        const result = timeResults.find(r => r._id === range.min) || { count: 0 };
        const total = timeResults.reduce((sum, r) => sum + r.count, 0);
        return {
          range: range.label,
          count: result.count,
          percentage: total > 0 ? Math.round((result.count / total) * 100) : 0
        };
      });

      // Format failure reasons
      const failureReasons = failureResults.map(f => ({
        error: f._id || 'Unknown error',
        count: f.count
      }));

      return {
        totalAttempts,
        generationsByStatus,
        generationTimeDistribution,
        failureReasons
      };
    } catch (error) {
      logger.error('Failed to generate content generation stats', {
        error: error.message,
        query
      }, 'AdminContentStatsService');
      throw error;
    }
  }

  async getSourceStats(query?: AdminStatsQueryDto): Promise<ContentSourceStats> {
    logger.info('Generating content source stats', { query }, 'AdminContentStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      const pipeline: any[] = [
        ...(dateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$sources',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalContent: { $sum: '$count' },
            sourceGroups: {
              $push: {
                sources: '$_id',
                count: '$count'
              }
            },
            allSourceArrays: { $push: '$_id' }
          }
        },
        {
          $addFields: {
            averageSourcesPerContent: {
              $avg: { $map: { input: '$allSourceArrays', as: 'arr', in: { $size: '$$arr' } } }
            }
          }
        }
      ];

      const [result] = await this.contentModel.aggregate(pipeline);

      if (!result) {
        return {
          totalContent: 0,
          contentBySources: [],
          averageSourcesPerContent: 0
        };
      }

      // Format source breakdown
      const contentBySources = (result.sourceGroups || [])
        .map(group => ({
          sources: group.sources,
          count: group.count,
          percentage: Math.round((group.count / result.totalContent) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalContent: result.totalContent,
        contentBySources,
        averageSourcesPerContent: Math.round(result.averageSourcesPerContent * 10) / 10
      };
    } catch (error) {
      logger.error('Failed to generate content source stats', {
        error: error.message,
        query
      }, 'AdminContentStatsService');
      throw error;
    }
  }

  async getTimelineStats(query?: AdminStatsQueryDto): Promise<ContentTimelineStats> {
    logger.info('Generating content timeline stats', { query }, 'AdminContentStatsService');
    
    try {
      const { period = 'daily', limit = 30 } = query || {};
      
      // Get all content in date range
      const dateFilter = this.buildDateFilter(query);
      const contents = await this.contentModel
        .find(dateFilter ? { createdAt: dateFilter } : {})
        .select('date status')
        .sort({ date: -1 })
        .limit(limit * 2) // Get extra to ensure we have enough
        .exec();

      // Create a map of dates with content
      const contentMap = new Map<string, boolean>();
      contents.forEach(c => contentMap.set(c.date, c.status === 'generated'));

      // Generate expected date range
      const endDate = query?.endDate ? new Date(query.endDate) : new Date();
      const startDate = query?.startDate 
        ? new Date(query.startDate) 
        : new Date(endDate.getTime() - (limit - 1) * 24 * 60 * 60 * 1000);

      const contentByPeriod: Array<{ date: string; count: number; hasContent: boolean }> = [];
      const missingDates: string[] = [];
      let consecutiveDays = 0;
      let currentStreak = 0;
      let longestStreak = 0;

      // Iterate through date range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasContent = contentMap.has(dateStr);
        
        contentByPeriod.push({
          date: dateStr,
          count: hasContent ? 1 : 0,
          hasContent
        });

        if (!hasContent) {
          missingDates.push(dateStr);
          currentStreak = 0;
        } else {
          currentStreak++;
          consecutiveDays = currentStreak; // Current active streak
          longestStreak = Math.max(longestStreak, currentStreak);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        contentByPeriod: contentByPeriod.reverse(), // Oldest to newest
        missingDates,
        consecutiveDaysWithContent: consecutiveDays,
        longestStreak
      };
    } catch (error) {
      logger.error('Failed to generate content timeline stats', {
        error: error.message,
        query
      }, 'AdminContentStatsService');
      throw error;
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