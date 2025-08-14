import { AdminStatsQuery, BaseAdminQuery } from 'mystyc-common/admin';

const LIMIT = 50;

export function getDefaultStatsQuery(): Partial<AdminStatsQuery> {
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

export function getDefaultListQuery(page: number): BaseAdminQuery  {
    const query = {
      limit: LIMIT,
      offset: page * LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    } as const;
    return query;
}
