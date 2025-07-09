export interface ScheduleExecutionStatsResponse {
  overall: {
    totalExecutions: number;
    successRate: number;
    contentGenerationRate: number;
    notificationDeliveryRate: number;
  };
  byEventType: Array<{
    eventName: string;
    executions: number;
    successRate: number;
  }>;
  recentExecutions: Array<{
    executedAt: Date;
    eventName: string;
    status: string;
    timezone?: string;
  }>;
}
