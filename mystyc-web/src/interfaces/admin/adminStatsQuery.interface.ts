import { AdminUserStatsQuery } from "./adminUserStatsQuery.interface";
import { AdminDeviceStatsQuery } from "./adminDeviceStatsQuery.interface";
import { AdminAuthEventStatsQuery } from "./adminAuthEventStatsQuery";
import { AdminNotificationStatsQuery } from "./adminNotificationStatsQuery";

export interface AdminStatsQuery {
  user?: AdminUserStatsQuery;
  device?: AdminDeviceStatsQuery;
  authEvent?: AdminAuthEventStatsQuery;
  notification?: AdminNotificationStatsQuery;
}