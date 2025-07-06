import { IsOptional } from 'class-validator';
import { AdminUserStatsQueryDto } from "./admin-user-stats-query.dto";
import { AdminDeviceStatsQueryDto } from "./admin-device-stats-query.dto";
import { AuthEventStatsQueryDto } from "./admin-auth-event-stats-query.dto";
import { NotificationStatsQueryDto } from "./admin-notification-stats-query.dto";
import { DailyContentStatsQueryDto } from "./admin-daily-content-stats-query.dto";

export class AdminStatsQueryDto {
  @IsOptional()
  user?: AdminUserStatsQueryDto
  device?: AdminDeviceStatsQueryDto
  authEvent?: AuthEventStatsQueryDto
  notification?: NotificationStatsQueryDto
  dailyContent?: DailyContentStatsQueryDto
}