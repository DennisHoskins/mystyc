import { useAdminStats } from './useAdminStats';
import { useAdminSessions } from './useAdminSessions';
import { useAdminUsers } from './useAdminUsers';
import { useAdminDevices } from './useAdminDevices';
import { useAdminAuthEvents } from './useAdminAuthEvents';
import { useAdminContent } from './useAdminContent';
import { useAdminSubscriptions } from './useAdminSubscriptions';
import { useAdminOpenAI } from './useAdminOpenAI';
import { useAdminTraffic } from './useAdminTraffic';
import { useAdminNotifications } from './useAdminNotifications';
import { useAdminSchedules } from './useAdminSchedules';
import { useAdminScheduleExecutions } from './useAdminScheduleExecutions';

export function useAdmin() {
  const stats = useAdminStats();
  const sessions = useAdminSessions();
  const users = useAdminUsers();
  const devices = useAdminDevices();
  const auth = useAdminAuthEvents();
  const content = useAdminContent();
  const subscriptions = useAdminSubscriptions();
  const openai = useAdminOpenAI();
  const traffic = useAdminTraffic();
  const notifications = useAdminNotifications();
  const schedules = useAdminSchedules();
  const executions = useAdminScheduleExecutions();

  return {
    admin: {
      stats,
      sessions,
      users,
      devices,
      auth,
      content,
      subscriptions,
      openai,
      traffic,
      notifications,
      schedules,
      executions,
    }
  };
}