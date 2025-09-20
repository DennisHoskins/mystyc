import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  RegistrationStatsResponse,
  ProfileCompletionStats,
  UserActivityStats
} from 'mystyc-common/admin/interfaces/stats/admin-user-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { UserProfilesService } from '@/users/user-profiles.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { UserProfileDocument } from '@/users/schemas/user-profile.schema';
import { AuthEventDocument } from '@/auth-events/schemas/auth-event.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';
import { StatsAggregationBuilder } from '@/admin/stats/pipeline-builder';

@RegisterStatsModule({
  serviceName: 'Users',
  service: AdminUsersStatsService,
  stats: [
    { key: 'registrations', method: 'getRegistrationStats' },
    { key: 'profiles', method: 'getProfileCompletionStats' },
    { key: 'activity', method: 'getActivityStats' }
  ]
})
@Injectable()
export class AdminUsersStatsService {
  constructor(
    @InjectModel('UserProfile') private userModel: Model<UserProfileDocument>,
    @InjectModel('AuthEvent') private authEventModel: Model<AuthEventDocument>,
    private readonly userProfilesService: UserProfilesService,
    private readonly authEventsService: AuthEventsService,
  ) {}

  async getRegistrationStats(query?: AdminStatsQuery): Promise<RegistrationStatsResponse> {
    logger.info('Generating registration stats', { query }, 'AdminUsersStatsService');

    const { period = 'daily', limit = 30 } = query || {};
    const now = new Date();
    
    // Calculate overall date range
    let startDate: Date;
    if (period === 'daily') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (limit - 1));
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - ((limit - 1) * 7));
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else { // monthly
      startDate = new Date(now.getFullYear(), now.getMonth() - (limit - 1), 1);
    }

    // Use the pipeline builder for date filtering and grouping
    const pipeline = StatsAggregationBuilder
      .create()
      .dateFilter({ startDate: startDate.toISOString(), endDate: now.toISOString() })
      .groupByDatePeriod(period)
      .sort('_id', 1)
      .build();

    const aggregateResults = await this.userModel.aggregate(pipeline);
    const resultMap = new Map(aggregateResults.map(r => [r._id, r.count]));

    // Generate complete date range with zeros for missing dates
    const data: Array<{ date: string; count: number }> = [];
    for (let i = limit - 1; i >= 0; i--) {
      let dateLabel: string;

      if (period === 'daily') {
        const currentDate = new Date(now);
        currentDate.setDate(now.getDate() - i);
        dateLabel = currentDate.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const currentDate = new Date(now);
        currentDate.setDate(now.getDate() - (i * 7));
        currentDate.setDate(currentDate.getDate() - currentDate.getDay());
        dateLabel = currentDate.toISOString().split('T')[0];
      } else { // monthly
        const currentDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dateLabel = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }

      const count = (resultMap.get(dateLabel) as number) || 0;
      data.push({ date: dateLabel, count });
    }

    return {
      period,
      data,
      totalPeriods: limit
    };
  }

  async getProfileCompletionStats(query?: AdminStatsQuery): Promise<ProfileCompletionStats> {
    logger.info('Generating profile completion stats', { query }, 'AdminUsersStatsService');

    const { maxRecords = 10000 } = query || {};
    const totalUsers = await this.userModel.countDocuments();
    
    const allUsers = await this.userProfilesService.findAll({ 
      limit: maxRecords,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    const usersWithFullName = allUsers.filter(user => user.firstName && user.firstName.trim() && user.lastName && user.lastName.trim()).length;
    const usersWithDateOfBirth = allUsers.filter(user => user.dateOfBirth).length;
    const usersWithZodiacSign = allUsers.filter(user => user.astrology?.createdAt).length;
    
    const usersWithAllFields = allUsers.filter(user => 
      user.firstName && user.firstName.trim() && user.lastName && user.lastName.trim() &&
      user.dateOfBirth &&
      user.astrology?.createdAt
    ).length;

    const stats = {
      totalUsers,
      usersWithFullName,
      usersWithDateOfBirth,
      usersWithZodiacSign,
      completionPercentageRates: {
        fullName: totalUsers > 0 ? Math.round((usersWithFullName / totalUsers) * 100) : 0,
        dateOfBirth: totalUsers > 0 ? Math.round((usersWithDateOfBirth / totalUsers) * 100) : 0,
        zodiacSign: totalUsers > 0 ? Math.round((usersWithZodiacSign / totalUsers) * 100) : 0,
        totalComplete: totalUsers > 0 ? Math.round((usersWithAllFields / totalUsers) * 100) : 0
      }
    };

    logger.info('Profile completion stats generated', stats, 'AdminUsersStatsService');
    return stats;
  }

  async getActivityStats(query?: AdminStatsQuery): Promise<UserActivityStats> {
    logger.info('Generating user activity stats', { query }, 'AdminUsersStatsService');

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users count efficiently
    const totalUsers = await this.userModel.countDocuments();

    // Single aggregation to get unique active users for all time periods
    const pipeline: any[] = [
      {
        $match: {
          timestamp: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: "$firebaseUid",
          lastActivity: { $max: "$timestamp" }
        }
      },
      {
        $group: {
          _id: null,
          activeUsersLast24Hours: {
            $sum: { $cond: [{ $gte: ["$lastActivity", last24Hours] }, 1, 0] }
          },
          activeUsersLast7Days: {
            $sum: { $cond: [{ $gte: ["$lastActivity", last7Days] }, 1, 0] }
          },
          activeUsersLast30Days: {
            $sum: { $cond: [{ $gte: ["$lastActivity", last30Days] }, 1, 0] }
          }
        }
      }
    ];

    const [result] = await this.authEventModel.aggregate(pipeline);
    
    const activeUsers = result || {
      activeUsersLast24Hours: 0,
      activeUsersLast7Days: 0,
      activeUsersLast30Days: 0
    };

    const inactiveUsers = totalUsers - activeUsers.activeUsersLast30Days;

    const stats = {
      totalUsers,
      activeUsers: {
        last24Hours: activeUsers.activeUsersLast24Hours,
        last7Days: activeUsers.activeUsersLast7Days,
        last30Days: activeUsers.activeUsersLast30Days
      },
      inactiveUsers: Math.max(0, inactiveUsers)
    };

    logger.info('User activity stats generated', stats, 'AdminUsersStatsService');
    return stats;
  }
}