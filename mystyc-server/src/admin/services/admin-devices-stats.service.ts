import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { 
  PlatformStatsResponse,
  FcmTokenStats,
  DeviceActivityStats,
  DeviceUserAgentStats
} from 'mystyc-common/admin/interfaces/stats/admin-device-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { DeviceDocument } from '@/devices/schemas/device.schema';
import { AuthEventDocument } from '@/auth-events/schemas/auth-event.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'Devices',
  service: AdminDevicesStatsService,
  stats: [
    { key: 'platforms', method: 'getPlatformStats' },
    { key: 'fcmTokens', method: 'getFcmTokenStats' },
    { key: 'activity', method: 'getDeviceActivityStats' },
    { key: 'userAgents', method: 'getUserAgentStats' }
  ]
})
@Injectable()
export class AdminDevicesStatsService {
  constructor(
    @InjectModel('Device') private deviceModel: Model<DeviceDocument>,
    @InjectModel('AuthEvent') private authEventModel: Model<AuthEventDocument>,
    private readonly devicesService: DevicesService,
    private readonly authEventsService: AuthEventsService,
  ) {}

  async getPlatformStats(query?: AdminStatsQuery): Promise<PlatformStatsResponse> {
    logger.info('Generating platform stats', { query }, 'AdminDevicesStatsService');
    
    const pipeline: any[] = [
      {
        $sort: { updatedAt: -1 }
      },
      {
        $group: {
          _id: '$deviceId',
          latestDevice: { $first: '$$ROOT' }
        }
      },
      {
        $group: {
          _id: '$latestDevice.platform',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalDevices: { $sum: '$count' },
          platforms: {
            $push: {
              platform: '$_id',
              count: '$count'
            }
          }
        }
      }
    ];

    const [result] = await this.deviceModel.aggregate(pipeline);
    
    if (!result) {
      return {
        totalDevices: 0,
        platforms: []
      };
    }

    const platformsWithPercentage = result.platforms.map((p: { platform: string, count: number }) => ({
      platform: p.platform,
      count: p.count,
      percentage: Math.round((p.count / result.totalDevices) * 100)
    }));

    return {
      totalDevices: result.totalDevices,
      platforms: platformsWithPercentage.sort((a: { platform: string, count: number }, b: { platform: string, count: number }) => b.count - a.count)
    };
  }

  async getFcmTokenStats(query?: AdminStatsQuery): Promise<FcmTokenStats> {
    logger.info('Generating FCM token stats', { query }, 'AdminDevicesStatsService');
    
    const pipeline: any[] = [
      {
        $sort: { updatedAt: -1 }
      },
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
                { $and: [{ $ne: ['$latestDevice.fcmToken', null] }, { $ne: ['$latestDevice.fcmToken', ''] }] },
                1,
                0
              ]
            }
          },
          tokenAges: {
            $push: {
              $cond: [
                { $ne: ['$latestDevice.fcmTokenUpdatedAt', null] },
                {
                  $divide: [
                    { $subtract: [new Date(), '$latestDevice.fcmTokenUpdatedAt'] },
                    86400000
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
          devicesWithoutFcmToken: { $subtract: ['$totalDevices', '$devicesWithFcmToken'] },
          fcmTokenCoverage: {
            $cond: [
              { $gt: ['$totalDevices', 0] },
              { $round: [{ $multiply: [{ $divide: ['$devicesWithFcmToken', '$totalDevices'] }, 100] }] },
              0
            ]
          },
          averageTokenAge: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$tokenAges', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $round: [{ $avg: { $filter: { input: '$tokenAges', cond: { $ne: ['$$this', null] } } } }] },
              0
            ]
          }
        }
      }
    ];

    const [result] = await this.deviceModel.aggregate(pipeline);
    
    if (!result) {
      return {
        totalDevices: 0,
        devicesWithFcmToken: 0,
        devicesWithoutFcmToken: 0,
        fcmTokenCoverage: 0,
        averageTokenAge: 0
      };
    }

    return {
      totalDevices: result.totalDevices,
      devicesWithFcmToken: result.devicesWithFcmToken,
      devicesWithoutFcmToken: result.devicesWithoutFcmToken,
      fcmTokenCoverage: result.fcmTokenCoverage,
      averageTokenAge: result.averageTokenAge
    };
  }

  async getDeviceActivityStats(query?: AdminStatsQuery): Promise<DeviceActivityStats> {
    logger.info('Generating device activity stats', { query }, 'AdminDevicesStatsService');
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get unique device counts and activity
    const deviceActivityPipeline: any[] = [
      {
        $match: {
          timestamp: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: '$deviceId',
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $group: {
          _id: null,
          activeDevicesLast24Hours: {
            $sum: { $cond: [{ $gte: ['$lastActivity', last24Hours] }, 1, 0] }
          },
          activeDevicesLast7Days: {
            $sum: { $cond: [{ $gte: ['$lastActivity', last7Days] }, 1, 0] }
          },
          activeDevicesLast30Days: {
            $sum: { $cond: [{ $gte: ['$lastActivity', last30Days] }, 1, 0] }
          }
        }
      }
    ];

    // Get multi-device user stats - group by deviceId first to get unique devices
    const multiDevicePipeline: any[] = [
      {
        $group: {
          _id: '$deviceId',
          firebaseUid: { $first: '$firebaseUid' } // Get any firebaseUid for this device
        }
      },
      {
        $group: {
          _id: '$firebaseUid',
          deviceCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          usersWithMultipleDevices: {
            $sum: { $cond: [{ $gt: ['$deviceCount', 1] }, 1, 0] }
          },
          totalDeviceCount: { $sum: '$deviceCount' },
          averageDevicesPerUser: { $avg: '$deviceCount' }
        }
      }
    ];

    const [activityResult] = await this.authEventModel.aggregate(deviceActivityPipeline);
    const [multiDeviceResult] = await this.deviceModel.aggregate(multiDevicePipeline);
    
    // Get total unique devices
    const totalDevicesPipeline = [
      { $group: { _id: '$deviceId' } },
      { $count: 'total' }
    ];
    const totalDevices = await this.deviceModel.aggregate(totalDevicesPipeline);

    const totalUniqueDevices = totalDevices[0]?.total || 0;
    const activeDevices = activityResult || {
      activeDevicesLast24Hours: 0,
      activeDevicesLast7Days: 0,
      activeDevicesLast30Days: 0
    };

    const multiDevice = multiDeviceResult || {
      totalUsers: 0,
      usersWithMultipleDevices: 0,
      averageDevicesPerUser: 0
    };

    return {
      totalDevices: totalUniqueDevices,
      activeDevices: {
        last24Hours: activeDevices.activeDevicesLast24Hours,
        last7Days: activeDevices.activeDevicesLast7Days,
        last30Days: activeDevices.activeDevicesLast30Days
      },
      dormantDevices: Math.max(0, totalUniqueDevices - activeDevices.activeDevicesLast30Days),
      multiDeviceUsers: {
        totalUsers: multiDevice.totalUsers,
        usersWithMultipleDevices: multiDevice.usersWithMultipleDevices,
        averageDevicesPerUser: Math.round((multiDevice.averageDevicesPerUser || 0) * 100) / 100
      }
    };
  }

  async getUserAgentStats(query?: AdminStatsQuery): Promise<DeviceUserAgentStats> {
    logger.info('Generating user agent stats', { query }, 'AdminDevicesStatsService');
    
    const pipeline: any[] = [
      {
        $sort: { updatedAt: -1 } // Get most recent device record per deviceId
      },
      {
        $group: {
          _id: '$deviceId',
          latestDevice: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestDevice' }
      },
      {
        $group: {
          _id: null,
          totalDevices: { $sum: 1 },
          browsers: {
            $push: '$userAgentParsed.browser.name'
          },
          operatingSystems: {
            $push: '$userAgentParsed.os.name'
          },
          deviceTypes: {
            $push: {
              $cond: [
                { $ne: ['$userAgentParsed.device.type', null] },
                '$userAgentParsed.device.type',
                'desktop'
              ]
            }
          }
        }
      }
    ];

    const [result] = await this.deviceModel.aggregate(pipeline);
    
    if (!result) {
      return {
        totalDevices: 0,
        browsers: [],
        operatingSystems: [],
        deviceTypes: []
      };
    }

    const countAndPercentage = (items: string[], total: number) => {
      const counts = items.reduce((acc, item) => {
        if (item) {
          acc[item] = (acc[item] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      totalDevices: result.totalDevices,
      browsers: countAndPercentage(result.browsers, result.totalDevices).map(item => ({
        browser: item.name,
        count: item.count,
        percentage: item.percentage
      })),
      operatingSystems: countAndPercentage(result.operatingSystems, result.totalDevices).map(item => ({
        os: item.name,
        count: item.count,
        percentage: item.percentage
      })),
      deviceTypes: countAndPercentage(result.deviceTypes, result.totalDevices).map(item => ({
        type: item.name,
        count: item.count,
        percentage: item.percentage
      }))
    };
  }
}