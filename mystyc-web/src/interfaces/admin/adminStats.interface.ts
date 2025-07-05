import { RegistrationStatsResponse, ProfileCompletionStats, UserActivityStats } from './userStats.interface';

export interface AdminStatsResponse {
  users : {
    registrations: RegistrationStatsResponse,
    profiles: ProfileCompletionStats,
    activity: UserActivityStats,
  }
}
