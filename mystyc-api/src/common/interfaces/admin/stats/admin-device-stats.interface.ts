export interface PlatformStatsResponse {
  totalDevices: number;
  platforms: Array<{
    platform: string;
    count: number;
    percentage: number;
  }>;
}

export interface FcmTokenStats {
  totalDevices: number;
  devicesWithFcmToken: number;
  devicesWithoutFcmToken: number;
  fcmTokenCoverage: number;
  averageTokenAge: number;
}

export interface DeviceActivityStats {
  totalDevices: number;
  activeDevices: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  dormantDevices: number;
  multiDeviceUsers: {
    totalUsers: number;
    usersWithMultipleDevices: number;
    averageDevicesPerUser: number;
  };
}

export interface DeviceUserAgentStats {
  totalDevices: number;
  browsers: Array<{
    browser: string;
    count: number;
    percentage: number;
  }>;
  operatingSystems: Array<{
    os: string;
    count: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface DeviceStats{
  platforms: PlatformStatsResponse,
  fcmTokens: FcmTokenStats,
  activity: DeviceActivityStats,
  userAgents: DeviceUserAgentStats
}