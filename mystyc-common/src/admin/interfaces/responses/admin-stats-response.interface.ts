import { AdminStatsQuery } from '../../schemas/admin-queries.schema'

import { UserStats } from '../stats/admin-user-stats.interface'
import { DeviceStats } from '../stats/admin-device-stats.interface'
import { AuthEventStats } from '../stats/admin-auth-event-stats.interface'
import { NotificationStats } from '../stats/admin-notification-stats.interface'
import { OpenAIUsageStats } from '../stats/admin-openai-usage-stats.interface'
import { ScheduleStats } from '../stats/admin-schedule-stats.interface'
import { ScheduleExecutionStats } from '../stats/admin-schedule-execution-stats.interface'
import { SubscriptionStats } from '../stats/admin-subscription-stats.interface'
import { AstrologyStats } from '../stats/admin-astrology-stats.interface'

export interface AdminStatsResponse {
  users: UserStats,
  devices: DeviceStats
  authEvents: AuthEventStats,
  notifications: NotificationStats,
  openai: OpenAIUsageStats,
  schedule: ScheduleStats & {
    executions: ScheduleExecutionStats;
  },
  subscriptions: SubscriptionStats,
  astrology: AstrologyStats
}