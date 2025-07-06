import { AdminUserStatsQuery } from "./adminUserStatsQuery.interface";
import { AdminDeviceStatsQuery } from "./adminDeviceStatsQuery.interface";
import { AdminAuthEventStatsQuery } from "./adminAuthEventStatsQuery.interface";
import { AdminNotificationStatsQuery } from "./adminNotificationStatsQuery.interface";

export interface AdminStatsQuery {
  user?: AdminUserStatsQuery;
  device?: AdminDeviceStatsQuery;
  authEvent?: AdminAuthEventStatsQuery;
  notification?: AdminNotificationStatsQuery;
}