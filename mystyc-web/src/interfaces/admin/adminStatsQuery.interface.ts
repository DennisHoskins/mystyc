import { AdminUserStatsQuery } from "./adminUserStatsQuery.interface";
import { AdminDeviceStatsQuery } from "./adminDeviceStatsQuery.interface";
import { AdminAuthEventStatsQuery } from "./adminAuthEventStatsQuery.interface";
import { AdminNotificationStatsQuery } from "./adminNotificationStatsQuery.interface";
import { AdminContentStatsQuery } from "./adminContentStatsQuery.interface";
import { AdminSessionStatsQuery } from "./adminSessionStatsQuery.interface";
import { AdminTrafficStatsQuery } from "./adminTrafficStatsQuery.interface";

export interface AdminStatsQuery {
  user?: AdminUserStatsQuery;
  device?: AdminDeviceStatsQuery;
  authEvent?: AdminAuthEventStatsQuery;
  notification?: AdminNotificationStatsQuery;
  session?: AdminSessionStatsQuery;
  content?: AdminContentStatsQuery;
  traffic?: AdminTrafficStatsQuery;
}