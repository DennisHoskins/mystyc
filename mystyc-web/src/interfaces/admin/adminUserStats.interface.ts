export interface RegistrationStatsResponse {
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    count: number;
  }>;
  totalPeriods: number;
}

export interface ProfileCompletionStats {
  totalUsers: number;
  usersWithFullName: number;
  usersWithDateOfBirth: number;
  usersWithZodiacSign: number;
  completionPercentageRates: {
    fullName: number;
    dateOfBirth: number;
    zodiacSign: number;
    totalComplete: number;
  };
}

export interface UserActivityStats {
  totalUsers: number;
  activeUsers: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  inactiveUsers: number;
}

export interface UserStats {
  registrations: RegistrationStatsResponse,
  profiles: ProfileCompletionStats,
  activity: UserActivityStats,
}