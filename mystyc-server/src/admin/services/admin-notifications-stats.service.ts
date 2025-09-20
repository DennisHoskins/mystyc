import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  NotificationDeliveryStats,
  NotificationTypeStats,
  NotificationEngagementStats,
  NotificationPatternsStats
} from 'mystyc-common/admin/interfaces/stats/admin-notification-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { NotificationsService } from '@/notifications/notifications.service';
import { DevicesService } from '@/devices/devices.service';
import { NotificationDocument } from '@/notifications/schemas/notification.schema';
import { DeviceDocument } from '@/devices/schemas/device.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'Notifications',
  service: AdminNotificationsStatsService,
  stats: [
    { key: 'delivery', method: 'getDeliveryStats' },
    { key: 'type', method: 'getTypeStats' },
    { key: 'engagement', method: 'getEngagementStats' },
    { key: 'pattern', method: 'getPatternStats' }
  ]
})
@Injectable()
export class AdminNotificationsStatsService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<NotificationDocument>,
    @InjectModel('Device') private deviceModel: Model<DeviceDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly devicesService: DevicesService,
  ) {}

  async getDeliveryStats(query?: AdminStatsQuery): Promise<NotificationDeliveryStats> {
    logger.info('Generating notification delivery stats', { query }, 'AdminNotificationsStatsService');
    
    try {
      const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
      
      // Build date filter
      const dateMatch: any = {};
      if (query?.startDate || query?.endDate) {
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch.$lte = endDate;
        }
      } else {
        // Default to last 30 days for performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateMatch.$gte = thirtyDaysAgo;
      }

      const pipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            sent: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            // Calculate average delivery time for sent notifications
            deliveryTimes: {
              $push: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'sent'] },
                      { $ne: ['$sentAt', null] }
                    ]
                  },
                  {
                    $divide: [
                      { $subtract: ['$sentAt', '$createdAt'] },
                      1000 // Convert to seconds
                    ]
                  },
                  null
                ]
              }
            }
          }
        },
        {
          $addFields: {
            successRate: {
              $cond: [
                { $gt: ['$totalNotifications', 0] },
                { $round: [{ $multiply: [{ $divide: ['$sent', '$totalNotifications'] }, 100] }] },
                0
              ]
            },
            averageDeliveryTime: {
              $cond: [
                { $gt: [{ $size: { $filter: { input: '$deliveryTimes', cond: { $ne: ['$$this', null] } } } }, 0] },
                {
                  $round: [
                    { $avg: { $filter: { input: '$deliveryTimes', cond: { $ne: ['$$this', null] } } } },
                    2
                  ]
                },
                0
              ]
            }
          }
        }
      ];

      const [result] = await this.notificationModel.aggregate(pipeline);

      if (!result) {
        return {
          totalNotifications: 0,
          deliveryMetrics: {
            sent: 0,
            failed: 0,
            pending: 0,
            successRate: 0
          },
          averageDeliveryTime: 0
        };
      }

      logger.info('Notification delivery stats generated', {
        totalNotifications: result.totalNotifications,
        successRate: result.successRate,
        averageDeliveryTime: result.averageDeliveryTime
      }, 'AdminNotificationsStatsService');

      return {
        totalNotifications: result.totalNotifications,
        deliveryMetrics: {
          sent: result.sent,
          failed: result.failed,
          pending: result.pending,
          successRate: result.successRate
        },
        averageDeliveryTime: result.averageDeliveryTime
      };

    } catch (error) {
      logger.error('Failed to generate notification delivery stats', {
        error,
        query
      }, 'AdminNotificationsStatsService');
      throw error;
    }
  }

  async getTypeStats(query?: AdminStatsQuery): Promise<NotificationTypeStats> {
    logger.info('Generating notification type stats', { query }, 'AdminNotificationsStatsService');
    
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

      const pipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            sent: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            successRate: {
              $cond: [
                { $gt: ['$count', 0] },
                { $round: [{ $multiply: [{ $divide: ['$sent', '$count'] }, 100] }] },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: '$count' },
            typeBreakdown: {
              $push: {
                type: '$_id',
                count: '$count',
                successRate: '$successRate'
              }
            }
          }
        },
        {
          $addFields: {
            typeBreakdown: {
              $map: {
                input: '$typeBreakdown',
                as: 'type',
                in: {
                  type: '$$type.type',
                  count: '$$type.count',
                  percentage: {
                    $round: [
                      { $multiply: [{ $divide: ['$$type.count', '$totalNotifications'] }, 100] }
                    ]
                  },
                  successRate: '$$type.successRate'
                }
              }
            }
          }
        }
      ];

      const [result] = await this.notificationModel.aggregate(pipeline);

      if (!result) {
        return {
          totalNotifications: 0,
          typeBreakdown: []
        };
      }

      // Sort by count descending
      const sortedTypeBreakdown = result.typeBreakdown.sort((a: { count: number }, b: { count: number }) => b.count - a.count);

      logger.info('Notification type stats generated', {
        totalNotifications: result.totalNotifications,
        typesCount: sortedTypeBreakdown.length
      }, 'AdminNotificationsStatsService');

      return {
        totalNotifications: result.totalNotifications,
        typeBreakdown: sortedTypeBreakdown
      };

    } catch (error) {
      logger.error('Failed to generate notification type stats', {
        error,
        query
      }, 'AdminNotificationsStatsService');
      throw error;
    }
  }

  async getEngagementStats(query?: AdminStatsQuery): Promise<NotificationEngagementStats> {
    logger.info('Generating notification engagement stats', { query }, 'AdminNotificationsStatsService');
    
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

      // Get platform delivery stats by looking up device info
      const platformPipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch,
            deviceId: { $ne: null }
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: maxRecords },
        {
          $lookup: {
            from: 'devices',
            let: { deviceId: '$deviceId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$deviceId', '$$deviceId'] }
                }
              },
              {
                $group: {
                  _id: '$deviceId',
                  platform: { $first: '$platform' }
                }
              }
            ],
            as: 'deviceInfo'
          }
        },
        {
          $addFields: {
            platform: {
              $cond: [
                { $gt: [{ $size: '$deviceInfo' }, 0] },
                { $arrayElemAt: ['$deviceInfo.platform', 0] },
                'unknown'
              ]
            }
          }
        },
        {
          $group: {
            _id: '$platform',
            sent: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        },
        {
          $addFields: {
            successRate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $round: [{ $multiply: [{ $divide: ['$sent', '$total'] }, 100] }] },
                0
              ]
            }
          }
        },
        {
          $project: {
            platform: '$_id',
            sent: 1,
            failed: 1,
            successRate: 1,
            _id: 0
          }
        },
        { $sort: { sent: -1 } }
      ];

      // Get overall opt-in rate by checking devices with FCM tokens
      const optInPipeline: any[] = [
        {
          $group: {
            _id: '$deviceId',
            latestDevice: { $first: '$$ROOT' }
          }
        },
        {
          $group: {
            _id: null,
            totalDevices: { $sum: 1 },
            devicesWithFcmToken: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$latestDevice.fcmToken', null] },
                      { $ne: ['$latestDevice.fcmToken', ''] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            optInRate: {
              $cond: [
                { $gt: ['$totalDevices', 0] },
                { $round: [{ $multiply: [{ $divide: ['$devicesWithFcmToken', '$totalDevices'] }, 100] }] },
                0
              ]
            }
          }
        }
      ];

      // Get total notification count for this period
      const totalPipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch
          }
        },
        { $count: 'total' }
      ];

      const [platformResults, optInResults, totalResults] = await Promise.all([
        this.notificationModel.aggregate(platformPipeline),
        this.deviceModel.aggregate(optInPipeline),
        this.notificationModel.aggregate(totalPipeline)
      ]);

      const totalNotifications = totalResults[0]?.total || 0;
      const optInRate = optInResults[0]?.optInRate || 0;
      const deliveryByPlatform = platformResults || [];

      logger.info('Notification engagement stats generated', {
        totalNotifications,
        optInRate,
        platformsCount: deliveryByPlatform.length
      }, 'AdminNotificationsStatsService');

      return {
        totalNotifications,
        deliveryByPlatform,
        optInRate
      };

    } catch (error) {
      logger.error('Failed to generate notification engagement stats', {
        error,
        query
      }, 'AdminNotificationsStatsService');
      throw error;
    }
  }

  async getPatternStats(query?: AdminStatsQuery): Promise<NotificationPatternsStats> {
    logger.info('Generating notification pattern stats', { query }, 'AdminNotificationsStatsService');
    
    try {
      const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
      const { period = 'daily', limit = 30 } = query || {};
      
      // Build date filter
      const dateMatch: any = {};
      if (query?.startDate || query?.endDate) {
        if (query.startDate) dateMatch.$gte = new Date(query.startDate);
        if (query.endDate) dateMatch.$lte = new Date(query.endDate);
      } else {
        // Default period based on limit and period type
        const now = new Date();
        const daysBack = period === 'daily' ? limit : period === 'weekly' ? limit * 7 : limit * 30;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - daysBack);
        dateMatch.$gte = startDate;
      }

      // Peak hours analysis
      const peakHoursPipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: '$count' },
            peakHours: {
              $push: {
                hour: '$_id',
                count: '$count'
              }
            }
          }
        },
        {
          $addFields: {
            peakHours: {
              $map: {
                input: '$peakHours',
                as: 'hour',
                in: {
                  hour: '$$hour.hour',
                  count: '$$hour.count',
                  percentage: {
                    $round: [
                      { $multiply: [{ $divide: ['$$hour.count', '$totalNotifications'] }, 100] }
                    ]
                  }
                }
              }
            }
          }
        }
      ];

      // Volume trends over time
      const volumeTrendsPipeline: any[] = [
        {
          $match: {
            createdAt: dateMatch
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: maxRecords },
        {
          $group: {
            _id: period === 'daily' 
              ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
              : period === 'weekly'
              ? { 
                  $dateToString: { 
                    format: "%Y-%m-%d", 
                    date: {
                      $dateFromParts: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $subtract: [{ $dayOfMonth: "$createdAt" }, { $dayOfWeek: "$createdAt" }] }
                      }
                    }
                  }
                }
              : { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            count: 1,
            _id: 0
          }
        }
      ];

      const [peakHoursResult, volumeTrendsResult] = await Promise.all([
        this.notificationModel.aggregate(peakHoursPipeline),
        this.notificationModel.aggregate(volumeTrendsPipeline)
      ]);

      // Process peak hours
      let peakHours = [];
      let totalNotifications = 0;
      
      if (peakHoursResult[0]) {
        totalNotifications = peakHoursResult[0].totalNotifications;
        peakHours = peakHoursResult[0].peakHours.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
      }

      // Process volume trends
      const volumeTrends = volumeTrendsResult || [];

      logger.info('Notification pattern stats generated', {
        totalNotifications,
        peakHoursCount: peakHours.length,
        volumeTrendsCount: volumeTrends.length
      }, 'AdminNotificationsStatsService');

      return {
        totalNotifications,
        peakHours,
        volumeTrends
      };

    } catch (error) {
      logger.error('Failed to generate notification pattern stats', {
        error,
        query
      }, 'AdminNotificationsStatsService');
      throw error;
    }
  }
}