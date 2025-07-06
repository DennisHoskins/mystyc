export interface AdminDailyContentStatsQuery {
  period?: 'daily' | 'weekly' | 'monthly';

  limit?: number;

  maxRecords?: number;

  startDate?: string;

  endDate?: string;
}