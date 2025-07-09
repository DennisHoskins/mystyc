import { UserStats } from './adminUserStats.interface'
import { DeviceStats } from './adminDeviceStats.interface'
import { AuthEventStats } from './adminAuthEventStats.interface'
import { NotificationStats } from './adminNotificationStats.interface'
import { ContentStats } from './adminContentStats.interface'
import { ScheduleStats } from './adminScheduleStats.interface'

export interface AdminStatsResponse {
  users : UserStats,
  devices : DeviceStats
  authEvents : AuthEventStats,
  notifications : NotificationStats,
  content : ContentStats,
  schedule : ScheduleStats,
}
