import { StatsClient } from './StatsClient';
import { UserClient } from './UserClient';
import { DeviceClient } from './DeviceClient';
import { SessionClient } from './SessionClient';
import { ContentClient } from './ContentClient';
import { ScheduleClient } from './ScheduleClient';
import { PaymentClient } from './PaymentClient';
import { AuthEventClient } from './AuthEventClient';
import { NotificationClient } from './NotificationClient';
import { OpenAIClient } from './OpenAIClient';

import { AdminStatsQuery, BaseAdminQuery } from 'mystyc-common/admin';

const LIMIT = 20;

export class AdminApiClient {
  public readonly stats: StatsClient;
  public readonly users: UserClient;
  public readonly devices: DeviceClient;
  public readonly sessions: SessionClient;
  public readonly content: ContentClient;
  public readonly schedule: ScheduleClient;
  public readonly payments: PaymentClient;
  public readonly auth: AuthEventClient;
  public readonly notifications: NotificationClient;
  public readonly openai: OpenAIClient;

  constructor() {
    this.stats = new StatsClient();
    this.users = new UserClient();
    this.devices = new DeviceClient();
    this.sessions = new SessionClient();
    this.content = new ContentClient();
    this.schedule = new ScheduleClient();
    this.payments = new PaymentClient();
    this.auth = new AuthEventClient();
    this.notifications = new NotificationClient();
    this.openai = new OpenAIClient();
  }

  getDefaultStatsQuery(): Partial<AdminStatsQuery> {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29); // 30 days total including today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      maxRecords: 10000
    }
  };

  getDefaultListQuery(page: number): BaseAdminQuery  {
      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      } as const;
      return query;
  }
}

export const apiClientAdmin = new AdminApiClient();