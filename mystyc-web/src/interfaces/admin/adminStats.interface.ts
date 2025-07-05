import { RegistrationStatsResponse, ProfileCompletionStats, UserActivityStats } from './adminUserStats.interface';
import { PlatformStatsResponse, FcmTokenStats, DeviceActivityStats, DeviceUserAgentStats } from './adminDeviceStats.interface';
import { AuthEventSummaryStats, AuthenticationPatternsStats, SessionDurationStats, GeographicDistributionStats } from './adminAuthEventStats.interface';
import { NotificationDeliveryStats, NotificationTypeStats, NotificationEngagementStats, NotificationPatternsStats } from './adminNotificationStats.interface';
import { SessionSummaryStats } from './adminSessionStats.interface';

export interface AdminStatsResponse {
  users: {
    registrations: RegistrationStatsResponse,
    profiles: ProfileCompletionStats,
    activity: UserActivityStats,
  },
  devices: {
    platform: PlatformStatsResponse,
    fcmToken: FcmTokenStats,
    activity: DeviceActivityStats,
    userAgent: DeviceUserAgentStats
  },
  authEvents: {
    summary: AuthEventSummaryStats,
    pattern: AuthenticationPatternsStats,
    duration: SessionDurationStats,
    distribution: GeographicDistributionStats
  },
  notifications: {
    delivery: NotificationDeliveryStats,
    type: NotificationTypeStats,
    engagement: NotificationEngagementStats,
    pattern: NotificationPatternsStats
  },
  sessions: {
    summary: SessionSummaryStats
  }
}
