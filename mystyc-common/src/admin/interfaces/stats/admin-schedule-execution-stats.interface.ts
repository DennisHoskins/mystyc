// Individual component stats interfaces
export interface ScheduleExecutionSummaryStats {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface ScheduleExecutionPerformanceStats {
  scheduleId: string;
  eventName: string;
  eventType: 'notification';
  executions: ScheduleExecutionSummaryStats;
  lastExecuted?: Date;
  averageDuration: number;
  eventData: {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  };
}

export interface ScheduleHistoryStats {
  scheduleId: string;
  eventName: string;
  eventType: 'notification';
  timeRange: {
    start: Date;
    end: Date;
  };
  dailyPerformance: Array<{
    date: string;
    executionStatus: 'success' | 'failed' | 'not_run';
    eventSuccessRate?: number;
    totalEvents?: number;
  }>;
  trends: {
    executionTrend: 'improving' | 'declining' | 'stable';
    eventDeliveryTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface ScheduleSystemOverviewStats {
  totalExecutions: number;
  successRate: number;
  notificationDeliveryRate: number;
}

export interface ScheduleEventTypeStats {
  eventName: string;
  executions: number;
  successRate: number;
}

export interface ScheduleRecentExecutionStats {
  executedAt: Date;
  eventName: string;
  status: string;
  timezone?: string;
}

export interface ScheduleExecutionStats {
  systemOverview: ScheduleSystemOverviewStats;
  byEventType: ScheduleEventTypeStats[];
  recentExecutions: ScheduleRecentExecutionStats[];
}