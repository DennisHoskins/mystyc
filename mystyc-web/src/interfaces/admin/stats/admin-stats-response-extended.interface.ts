import { AdminStatsResponse } from './admin-stats-response.interface'
import { SessionStats } from './admin-session-stats.interface'
import { TrafficStats } from './admin-traffic-stats.interface'

export interface AdminStatsResponseExtended extends AdminStatsResponse {
  sessions: SessionStats,
  traffic: TrafficStats,
}