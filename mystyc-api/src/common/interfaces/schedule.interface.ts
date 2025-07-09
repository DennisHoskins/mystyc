export interface ScheduleTime {
  hour: number;
  minute: number;
}

export interface Schedule {
  _id?: string;
  time: ScheduleTime;
  event_name: string;
  enabled: boolean;
  timezone_aware: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}