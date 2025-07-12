export interface ScheduledTime {
  hour: number;
  minute: number;
}

export interface ScheduleExecution {
  _id?: string;
  scheduleId: string;
  eventName: string;
  scheduledTime: ScheduledTime;
  executedAt: Date;
  timezone?: string;
  localTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  error?: string;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}