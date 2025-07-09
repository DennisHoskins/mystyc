export interface ScheduleExecutionStats {
  scheduleId: string;
  eventName: string;
  executions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  lastExecuted?: Date;
  averageDuration: number;
  eventData: {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  };
  eventType: 'content' | 'notification';
}

export interface ScheduleExecutionHistoryStats {
  scheduleId: string;
  eventName: string;
  eventType: 'content' | 'notification';
  timeRange: {
    start: Date;
    end: Date;
  };
  dailyPerformance: Array<{
    date: string;
    executionStatus: 'success' | 'failed' | 'not_run';
    eventSuccessRate?: number; // Only if execution succeeded
    totalEvents?: number; // Only if execution succeeded
  }>;
  trends: {
    executionTrend: 'improving' | 'declining' | 'stable';
    eventDeliveryTrend: 'improving' | 'declining' | 'stable';
  };
}