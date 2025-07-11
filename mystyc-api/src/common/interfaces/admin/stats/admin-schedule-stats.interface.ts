export interface ScheduleSummaryStats {
  totalSchedules: number;
  enabledSchedules: number;
  disabledSchedules: number;
  timezoneAwareSchedules: number;
  globalSchedules: number;
  schedulesByEventName: Array<{
    eventName: string;
    count: number;
    enabled: number;
    disabled: number;
  }>;
}

export interface SchedulePerformanceStats {
  totalSchedules: number;
  executionStats: Array<{
    eventName: string;
    timezoneAware: boolean;
    scheduledTime: string; // "HH:MM" format
    enabled: boolean;
    lastUpdated: Date;
  }>;
  upcomingExecutions: Array<{
    eventName: string;
    scheduledTime: string;
    nextExecution: Date;
    timezoneAware: boolean;
  }>;
}

export interface ScheduleFailureStats {
  totalSchedules: number;
  monitoringNote: string;
}

export interface ScheduleStats {
  summary: ScheduleSummaryStats;
  performance: SchedulePerformanceStats;
  failures: ScheduleFailureStats;
}
