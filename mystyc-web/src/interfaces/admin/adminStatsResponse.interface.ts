import { UserStats } from './adminUserStats.interface'
import { DeviceStats } from './adminDeviceStats.interface'
import { AuthEventStats } from './adminAuthEventStats.interface'
import { NotificationStats } from './adminNotificationStats.interface'
import { SessionStats } from './adminSessionStats.interface'
import { ScheduleStats } from './adminScheduleStats.interface'
import { ContentStats } from './adminContentStats.interface'
import { TrafficStats } from './adminTrafficStats.interface'

export interface AdminStatsResponse {
  users : UserStats,
  devices : DeviceStats
  authEvents : AuthEventStats,
  schedule: ScheduleStats,
  content: ContentStats,
  notifications : NotificationStats,
  sessions: SessionStats,
  traffic?: TrafficStats,
}
