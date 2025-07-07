import { UserStats } from './adminUserStats.interface'
import { DeviceStats } from './adminDeviceStats.interface'
import { AuthEventStats } from './adminAuthEventStats.interface'
import { NotificationStats } from './adminNotificationStats.interface'
import { SessionStats } from './adminSessionStats.interface'
import { TrafficStats } from './adminTrafficStats.interface'

export interface AdminStatsResponse {
  users : UserStats,
  devices : DeviceStats
  authEvents : AuthEventStats,
  notifications : NotificationStats,
  sessions: SessionStats,
  traffic?: TrafficStats
}
