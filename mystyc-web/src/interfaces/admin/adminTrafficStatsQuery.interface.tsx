export interface AdminTrafficStatsQuery {
  period?: 'daily' | 'weekly' | 'monthly';

  limit?: number;

  maxRecords?: number;

  startDate?: string;

  endDate?: string;
}