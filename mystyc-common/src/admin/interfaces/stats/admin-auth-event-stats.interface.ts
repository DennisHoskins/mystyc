export interface AuthEventSummaryStats {
  totalEvents: number;
  eventsByType: Array<{
    type: 'create' | 'login' | 'logout' | 'server-logout';
    count: number;
    percentage: number;
  }>;
}

export interface AuthenticationPatternsStats {
  totalEvents: number;
  peakHours: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
  loginFrequency: {
    averageLoginsPerUser: number;
    mostActiveUsers: Array<{
      firebaseUid: string;
      email: string;
      loginCount: number;
    }>;
  };
}

export interface SessionDurationStats {
  totalSessions: number;
  averageSessionDuration: number;
  sessionDurations: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface GeographicDistributionStats {
  totalEvents: number;
  uniqueIPs: number;
  topIPs: Array<{
    ip: string;
    count: number;
    percentage: number;
  }>;
}

export interface AuthEventStats {
  summary: AuthEventSummaryStats,
  pattern: AuthenticationPatternsStats,
  duration: SessionDurationStats,
  distribution: GeographicDistributionStats
}