import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  AuthEventSummaryStats,
  AuthenticationPatternsStats,
  SessionDurationStats,
  GeographicDistributionStats
} from 'mystyc-common/admin/interfaces/stats/admin-auth-event-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { AuthEventDocument } from '@/auth-events/schemas/auth-event.schema';
import { UserProfileDocument } from '@/users/schemas/user-profile.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'AuthEvents',
  service: AdminAuthEventsStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' },
    { key: 'duration', method: 'getSessionDurationStats' },
    { key: 'pattern', method: 'getPatternStats' },
    { key: 'distribution', method: 'getGeographicStats' }
  ]
})
@Injectable()
export class AdminAuthEventsStatsService {
  constructor(
    @InjectModel('AuthEvent') private authEventModel: Model<AuthEventDocument>,
    @InjectModel('UserProfile') private userModel: Model<UserProfileDocument>,
    private readonly authEventsService: AuthEventsService,
    private readonly userProfilesService: UserProfilesService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<AuthEventSummaryStats> {
    logger.info('Generating auth event summary stats', { query }, 'AdminAuthEventsStatsService');
    
    try {
      const pipeline: any[] = [];
      
      // Add date filtering if provided
      if (query?.startDate || query?.endDate) {
        const dateMatch: any = {};
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch.$lte = endDate;
        }

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
            eventsByType: {
              $push: {
                type: '$_id',
                count: '$count'
              }
            }
          }
        }
      );

      const [result] = await this.authEventModel.aggregate(pipeline);

      if (!result) {
        return {
          totalEvents: 0,
          eventsByType: []
        };
      }

      // Calculate percentages
      const eventsByTypeWithPercentage = result.eventsByType.map((event: { type: string; count: number }) => ({
        type: event.type,
        count: event.count,
        percentage: Math.round((event.count / result.totalEvents) * 100)
      })).sort((a: { type: string; count: number }, b: { type: string; count: number }) => b.count - a.count);

      logger.info('Auth event summary stats generated', {
        totalEvents: result.totalEvents,
        typesCount: eventsByTypeWithPercentage.length
      }, 'AdminAuthEventsStatsService');

      return {
        totalEvents: result.totalEvents,
        eventsByType: eventsByTypeWithPercentage
      };

    } catch (error) {
      logger.error('Failed to generate auth event summary stats', {
        error,
        query
      }, 'AdminAuthEventsStatsService');
      throw error;
    }
  }

  async getPatternStats(query?: AdminStatsQuery): Promise<AuthenticationPatternsStats> {
    logger.info('Generating auth event pattern stats', { query }, 'AdminAuthEventsStatsService');
    
    try {
      const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
      
      // Build date filter
      const dateMatch: any = {};
      if (query?.startDate || query?.endDate) {
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) dateMatch.$lte = new Date(query.endDate);
      } else {
        // Default to last 30 days for performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateMatch.$gte = thirtyDaysAgo;
      }

      // Peak hours analysis
      const peakHoursPipeline: any[] = [
        {
          $match: {
            timestamp: dateMatch,
            type: { $in: ['login', 'create'] } // Only count actual authentications
          }
        },
        { $sort: { timestamp: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: '$count' },
            peakHours: {
              $push: {
                hour: '$_id',
                count: '$count'
              }
            }
          }
        }
      ];

      // Most active users analysis (only login events for performance)
      const activeUsersPipeline: any[] = [
        {
          $match: {
            timestamp: dateMatch,
            type: 'login' // Only count logins
          }
        },
        { $sort: { timestamp: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: '$firebaseUid',
            loginCount: { $sum: 1 },
            email: { $first: '$email' } // Get email from first record
          }
        },
        { $sort: { loginCount: -1 } },
        { $limit: 10 }, // Top 10 most active users
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalLogins: { $sum: '$loginCount' },
            mostActiveUsers: {
              $push: {
                firebaseUid: '$_id',
                email: '$email',
                loginCount: '$loginCount'
              }
            }
          }
        }
      ];

      const [peakHoursResult, activeUsersResult] = await Promise.all([
        this.authEventModel.aggregate(peakHoursPipeline),
        this.authEventModel.aggregate(activeUsersPipeline)
      ]);

      // Process peak hours
      let peakHours = [];
      let totalEvents = 0;

      if (peakHoursResult[0]) {
        totalEvents = peakHoursResult[0].totalEvents;
        peakHours = peakHoursResult[0].peakHours.map((hour: { hour: number, count: number }) => ({
          hour: hour.hour,
          count: hour.count,
          percentage: Math.round((hour.count / totalEvents) * 100)
        })).sort((a: { hour: number, count: number }, b: { hour: number, count: number }) => b.count - a.count);
      }

      // Process active users
      let averageLoginsPerUser = 0;
      let mostActiveUsers = [];
      
      if (activeUsersResult[0]) {
        const result = activeUsersResult[0];
        averageLoginsPerUser = result.totalUsers > 0 
          ? Math.round((result.totalLogins / result.totalUsers) * 100) / 100 
          : 0;
        mostActiveUsers = result.mostActiveUsers || [];
      }

      logger.info('Auth event pattern stats generated', {
        totalEvents,
        peakHoursCount: peakHours.length,
        activeUsersCount: mostActiveUsers.length,
        averageLoginsPerUser
      }, 'AdminAuthEventsStatsService');

      return {
        totalEvents,
        peakHours,
        loginFrequency: {
          averageLoginsPerUser,
          mostActiveUsers
        }
      };

    } catch (error) {
      logger.error('Failed to generate auth event pattern stats', {
        error,
        query
      }, 'AdminAuthEventsStatsService');
      throw error;
    }
  }

  async getSessionDurationStats(query?: AdminStatsQuery): Promise<SessionDurationStats> {
    logger.info('Generating session duration stats', { query }, 'AdminAuthEventsStatsService');
    
    try {
      const maxRecords = Math.min(query?.maxRecords || 30000, 50000); // Lower limit for complex query
      
      // Build date filter
      const dateMatch: any = {};
      if (query?.startDate || query?.endDate) {
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) dateMatch.$lte = new Date(query.endDate);
      } else {
        // Default to last 14 days for performance (session analysis is expensive)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        dateMatch.$gte = fourteenDaysAgo;
      }

      const pipeline: any[] = [
        {
          $match: {
            timestamp: dateMatch,
            type: { $in: ['login', 'logout', 'create'] }
          }
        },
        { $sort: { firebaseUid: 1, timestamp: 1 } },
        { $limit: maxRecords },
        // Group by user and device to track sessions
        {
          $group: {
            _id: {
              firebaseUid: '$firebaseUid',
              deviceId: '$deviceId'
            },
            events: {
              $push: {
                type: '$type',
                timestamp: '$timestamp'
              }
            }
          }
        },
        // Calculate session durations using $reduce
        {
          $addFields: {
            sessionDurations: {
              $reduce: {
                input: '$events',
                initialValue: {
                  sessions: [],
                  currentLogin: null
                },
                in: {
                  $cond: {
                    if: { $in: ['$$this.type', ['login', 'create']] },
                    then: {
                      sessions: '$$value.sessions',
                      currentLogin: '$$this.timestamp'
                    },
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            { $eq: ['$$this.type', 'logout'] },
                            { $ne: ['$$value.currentLogin', null] }
                          ]
                        },
                        then: {
                          sessions: {
                            $concatArrays: [
                              '$$value.sessions',
                              [{
                                $divide: [
                                  { $subtract: ['$$this.timestamp', '$$value.currentLogin'] },
                                  1000 * 60 // Convert to minutes
                                ]
                              }]
                            ]
                          },
                          currentLogin: null
                        },
                        else: '$$value'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Unwind the session durations
        {
          $unwind: {
            path: '$sessionDurations.sessions',
            preserveNullAndEmptyArrays: false
          }
        },
        // Filter out unrealistic session durations (> 24 hours or < 0)
        {
          $match: {
            'sessionDurations.sessions': {
              $gte: 0,
              $lte: 1440 // Max 24 hours in minutes
            }
          }
        },
        // Group all sessions and categorize by duration
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalDurationMinutes: { $sum: '$sessionDurations.sessions' },
            shortSessions: {
              $sum: {
                $cond: [{ $lt: ['$sessionDurations.sessions', 5] }, 1, 0]
              }
            },
            mediumSessions: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$sessionDurations.sessions', 5] },
                      { $lt: ['$sessionDurations.sessions', 30] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            longSessions: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$sessionDurations.sessions', 30] },
                      { $lt: ['$sessionDurations.sessions', 120] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            veryLongSessions: {
              $sum: {
                $cond: [{ $gte: ['$sessionDurations.sessions', 120] }, 1, 0]
              }
            }
          }
        }
      ];

      const [result] = await this.authEventModel.aggregate(pipeline);

      if (!result) {
        return {
          totalSessions: 0,
          averageSessionDuration: 0,
          sessionDurations: []
        };
      }

      const averageSessionDuration = result.totalSessions > 0 
        ? Math.round((result.totalDurationMinutes / result.totalSessions) * 100) / 100
        : 0;

      const sessionDurations = [
        {
          range: '< 5 min',
          count: result.shortSessions,
          percentage: Math.round((result.shortSessions / result.totalSessions) * 100)
        },
        {
          range: '5-30 min',
          count: result.mediumSessions,
          percentage: Math.round((result.mediumSessions / result.totalSessions) * 100)
        },
        {
          range: '30min-2h',
          count: result.longSessions,
          percentage: Math.round((result.longSessions / result.totalSessions) * 100)
        },
        {
          range: '> 2 hours',
          count: result.veryLongSessions,
          percentage: Math.round((result.veryLongSessions / result.totalSessions) * 100)
        }
      ];

      logger.info('Session duration stats generated', {
        totalSessions: result.totalSessions,
        averageSessionDuration
      }, 'AdminAuthEventsStatsService');

      return {
        totalSessions: result.totalSessions,
        averageSessionDuration,
        sessionDurations
      };

    } catch (error) {
      logger.error('Failed to generate session duration stats', {
        error,
        query
      }, 'AdminAuthEventsStatsService');
      throw error;
    }
  }

  async getGeographicStats(query?: AdminStatsQuery): Promise<GeographicDistributionStats> {
    logger.info('Generating geographic distribution stats', { query }, 'AdminAuthEventsStatsService');
    
    try {
      const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
      
      // Build date filter
      const dateMatch: any = {};
      if (query?.startDate || query?.endDate) {
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) dateMatch.$lte = new Date(query.endDate);
      } else {
        // Default to last 30 days for performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateMatch.$gte = thirtyDaysAgo;
      }

      const matchCondition = {
        timestamp: dateMatch,
        ip: { $nin: [null, '', 'unknown'] }
      };

      // First get totals
      const totalsPipeline: any[] = [
        { $match: matchCondition },
        { $sort: { timestamp: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: '$ip',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: '$count' },
            uniqueIPs: { $sum: 1 }
          }
        }
      ];

      // Then get top IPs
      const topIPsPipeline: any[] = [
        { $match: matchCondition },
        { $sort: { timestamp: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: '$ip',
            count: { $sum: 1 },
            firstSeen: { $min: '$timestamp' },
            lastSeen: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ];

      const [totalsResult, topIPsResult] = await Promise.all([
        this.authEventModel.aggregate(totalsPipeline),
        this.authEventModel.aggregate(topIPsPipeline)
      ]);

      const totals = totalsResult[0] || { totalEvents: 0, uniqueIPs: 0 };
      const topIPs = topIPsResult || [];

      // Calculate percentages for top IPs
      const topIPsWithPercentage = topIPs.map(ip => ({
        ip: ip._id,
        count: ip.count,
        percentage: totals.totalEvents > 0 ? Math.round((ip.count / totals.totalEvents) * 100) : 0,
        firstSeen: ip.firstSeen,
        lastSeen: ip.lastSeen
      }));

      logger.info('Geographic distribution stats generated', {
        totalEvents: totals.totalEvents,
        uniqueIPs: totals.uniqueIPs,
        topIPsCount: topIPsWithPercentage.length
      }, 'AdminAuthEventsStatsService');

      return {
        totalEvents: totals.totalEvents,
        uniqueIPs: totals.uniqueIPs,
        topIPs: topIPsWithPercentage
      };

    } catch (error) {
      logger.error('Failed to generate geographic distribution stats', {
        error,
        query
      }, 'AdminAuthEventsStatsService');
      throw error;
    }
  }
}