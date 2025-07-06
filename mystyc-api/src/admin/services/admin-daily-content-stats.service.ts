import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyContentDocument } from '@/daily-content/schemas/daily-content.schema';
import { DailyContentService } from '@/daily-content/daily-content.service';
import { 
  DailyContentSummaryStats,
} from '@/common/interfaces/admin/adminDailyContentStats.interface';
import { DailyContentStatsQueryDto } from '@/admin/dto/stats/admin-daily-content-stats-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class AdminDailyContentStatsService {
  constructor(
    @InjectModel('DailyContent') private dailyContentModel: Model<DailyContentDocument>,
    private readonly dailyContentService: DailyContentService,
  ) {}

  async getSummaryStats(query?: DailyContentStatsQueryDto): Promise<DailyContentSummaryStats> {
    logger.info('Generating daily content summary stats', { query }, 'AdminDailyContentStatsService');
    
    try {
      const pipeline: any[] = [];
      
      // Add date filtering if provided
      if (query?.startDate || query?.endDate) {
        const dateMatch: any = {};
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) dateMatch.$lte = new Date(query.endDate);
        
        pipeline.push({
          $match: {
            timestamp: dateMatch
          }
        });
      }

      // Limit records processed for performance
      const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
      
      pipeline.push(
        // Sort by timestamp desc to get recent events first
        { $sort: { timestamp: -1 } },
        // Limit total records processed
        { $limit: maxRecords },
        // Group by event type and count
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        // Get total count and event breakdown
        {
          $group: {
            _id: null,
            totalEvents: { $sum: '$count' },
          }
        }
      );

      const [result] = await this.dailyContentModel.aggregate(pipeline);

      if (!result) {
        return {
          totalEvents: 0,
        };
      }

      logger.info('Daily Content summary stats generated', {
        totalEvents: result.totalEvents,
      }, 'AdminDailyContentStatsService');

      return {
        totalEvents: result.totalEvents,
      };
    } catch (error) {
      logger.error('Failed to generate daily content summary stats', {
        error: error.message,
        query
      }, 'AdminDailyContentStatsService');
      throw error;
    }
  }
}