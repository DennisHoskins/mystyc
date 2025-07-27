import { StatsClient } from './StatsClient';
import { SessionClient } from './SessionClient';
import { ContentClient } from './ContentClient';
import { ScheduleClient } from './ScheduleClient';
import { PaymentClient } from './PaymentClient';
import { OpenAIClient } from './OpenAIClient';

import { AdminStatsQuery, BaseAdminQuery } from 'mystyc-common/admin';

const LIMIT = 20;

export class AdminApiClient {
  public readonly stats: StatsClient;
  public readonly sessions: SessionClient;
  public readonly content: ContentClient;
  public readonly schedule: ScheduleClient;
  public readonly payments: PaymentClient;
  public readonly openai: OpenAIClient;

  constructor() {
    this.stats = new StatsClient();
    this.content = new ContentClient();
    this.schedule = new ScheduleClient();
    this.payments = new PaymentClient();
    this.sessions = new SessionClient();
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