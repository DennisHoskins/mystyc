import { UserStats } from './admin-user-stats.interface'
import { DeviceStats } from './admin-device-stats.interface'
import { AuthEventStats } from './admin-auth-event-stats.interface'
import { NotificationStats } from './admin-notification-stats.interface'
import { ContentStats } from './admin-content-stats.interface'
import { ScheduleStats } from './admin-schedule-stats.interface'
import { ScheduleExecutionStats } from './admin-schedule-execution-stats.interface'

export interface AdminStatsResponse {
  users: UserStats,
  devices: DeviceStats
  authEvents: AuthEventStats,
  notifications: NotificationStats,
  content: ContentStats,
  schedule: ScheduleStats & {
    executions: ScheduleExecutionStats;
  },
}