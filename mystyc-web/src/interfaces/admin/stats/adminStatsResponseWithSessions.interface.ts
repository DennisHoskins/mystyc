import { AdminStatsResponse } from './adminStatsResponse'
import { SessionStats } from './adminSessionStats.interface'
import { TrafficStats } from './adminTrafficStats.interface'

export interface AdminStatsResponseExtended extends AdminStatsResponse {
  sessions: SessionStats,
  traffic: TrafficStats,
}