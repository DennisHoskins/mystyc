import { AdminStatsQuerySchema, AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { TrafficStats } from '@/interfaces/admin/stats/admin-traffic-stats.interface';

import { logger } from '@/util/logger';

import redis from '@/server/util/redisClient';

type DateRange = {
  startDate: Date;
  endDate: Date;
  dateKeys: string[];
};

type AggregatedData<T = string> = Array<{ name: T; count: number; percentage?: number }>;

/**
 * Builds comprehensive traffic analytics from Redis based on the provided query.
 */
export async function buildTrafficStats(
  query: Partial<AdminStatsQuery> = {}
): Promise<TrafficStats> {

  const validatedQuery = AdminStatsQuerySchema.parse({
    period: 'daily',
    limit: 30,
    maxRecords: 10000,
    ...query
  });  

  const dateRange = calculateDateRange(validatedQuery);
  const maxRecords = validatedQuery.maxRecords ?? 50;

  try {
    // Fetch all data in parallel for better performance
    const [
      dailyVisits,
      pages,
      devices,
      userTypes,
      hourlyVisits,
      timezoneHourlyVisits,
      dayOfWeekVisits,
      browsers,
      oses,
      deviceTypes,
      timezones,
      languages,
      browserDevices,
      browserDevicesDetailed,
      platformDevices,
      fullCombinations
    ] = await Promise.all([
      getDailyVisits(dateRange),
      getAggregatedData('path_counts', dateRange, maxRecords),
      getAggregatedData('device_counts', dateRange, maxRecords),
      getUserTypes(dateRange),
      getAggregatedData('hourly_counts', dateRange, 24), // Max 24 hours
      getAggregatedData('timezone_hourly_counts', dateRange, 24),
      getDayOfWeekData(dateRange),
      getAggregatedData('browser_counts', dateRange, maxRecords),
      getAggregatedData('os_counts', dateRange, maxRecords),
      getAggregatedData('devicetype_counts', dateRange, maxRecords),
      getAggregatedData('timezone_counts', dateRange, maxRecords),
      getAggregatedData('language_counts', dateRange, maxRecords),
      getAggregatedData('browser_device_counts', dateRange, maxRecords),
      getAggregatedData('browser_device_detailed_counts', dateRange, maxRecords),
      getAggregatedData('platform_device_counts', dateRange, maxRecords),
      getAggregatedData('full_combination_counts', dateRange, maxRecords)
    ]);

    const totalVisits = dailyVisits.reduce((sum, v) => sum + v.count, 0);

    const stats: TrafficStats = {
      visitors: { totalVisits, dailyVisits },
      pages: addPercentages(pages, totalVisits).map(p => ({ path: p.name, count: p.count, percentage: p.percentage })),
      devices: addPercentages(devices, totalVisits).map(d => ({ deviceName: d.name, count: d.count, percentage: d.percentage })),
      userTypes,
      hourlyVisits: addPercentages(hourlyVisits, totalVisits).map(h => ({ hour: h.name, count: h.count, percentage: h.percentage })),
      timezoneHourlyVisits: addPercentages(timezoneHourlyVisits, totalVisits).map(h => ({ hour: h.name, count: h.count, percentage: h.percentage })),
      dayOfWeekVisits: addPercentages(dayOfWeekVisits, totalVisits),
      browsers: addPercentages(browsers, totalVisits).map(b => ({ browser: b.name, count: b.count, percentage: b.percentage })),
      oses: addPercentages(oses, totalVisits).map(o => ({ os: o.name, count: o.count, percentage: o.percentage })),
      deviceTypes: addPercentages(deviceTypes, totalVisits).map(dt => ({ type: dt.name, count: dt.count, percentage: dt.percentage })),
      timezones: addPercentages(timezones, totalVisits).map(tz => ({ timezone: tz.name, count: tz.count, percentage: tz.percentage })),
      languages: addPercentages(languages, totalVisits).map(l => ({ language: l.name, count: l.count, percentage: l.percentage })),
      browserDevices: addPercentages(browserDevices, totalVisits).map(bd => ({ 
        combination: bd.name, 
        count: bd.count, 
        percentage: bd.percentage 
      })),
      browserDevicesDetailed: addPercentages(browserDevicesDetailed, totalVisits).map(bd => ({ 
        combination: bd.name, 
        count: bd.count, 
        percentage: bd.percentage 
      })),
      platformDevices: addPercentages(platformDevices, totalVisits).map(pd => ({ 
        combination: pd.name, 
        count: pd.count, 
        percentage: pd.percentage 
      })),
      fullCombinations: addPercentages(fullCombinations, totalVisits).map(fc => ({ 
        combination: fc.name, 
        count: fc.count, 
        percentage: fc.percentage 
      }))
    };

    logger.log('[buildTrafficStats] Stats generated successfully', {
      totalVisits,
      dateRange: dateRange.dateKeys.length,
      categories: Object.keys(stats).length
    });

    return stats;
  } catch (error) {
    logger.error('[buildTrafficStats] Failed to generate stats', error);
    return getEmptyStats();
  }
}

/**
 * Calculate date range based on query parameters
 */
function calculateDateRange(query: AdminStatsQuery): DateRange {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  let startDate: Date;

  if (query.startDate) {
    startDate = new Date(query.startDate);
  } else if (query.period) {
    startDate = new Date(endDate);
    switch (query.period) {
      case 'weekly':
        startDate.setDate(endDate.getDate() - 6);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'daily':
      default:
        startDate = new Date(endDate);
        break;
    }
  } else if (query.limit) {
    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (query.limit - 1));
  } else {
    // Default to last 7 days instead of just today
    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7 days total including today
  }

  // Generate date keys
  const dateKeys: string[] = [];
  for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
    dateKeys.push(dt.toISOString().split('T')[0]);
  }

  return { startDate, endDate, dateKeys };
}

/**
 * Safely fetch and parse Redis hash data
 */
async function fetchHashSafely(key: string): Promise<Record<string, string>> {
  try {
    const raw = await redis.hGetAll(key);
    return raw || {};
  } catch (err) {
    logger.error('[buildTrafficStats] Redis HGETALL failed', key, err);
    return {};
  }
}

/**
 * Get daily visit counts
 */
async function getDailyVisits(dateRange: DateRange): Promise<Array<{ date: string; count: number }>> {
  const rawDaily = await fetchHashSafely('analytics:daily_counts');
  return dateRange.dateKeys.map(date => ({
    date,
    count: Number(rawDaily[date] || 0)
  }));
}

/**
 * Get aggregated data for a specific counter type
 */
async function getAggregatedData(
  counterType: string,
  dateRange: DateRange,
  limit: number
): Promise<AggregatedData> {
  const aggregated: Record<string, number> = {};

  // Aggregate across all dates
  for (const date of dateRange.dateKeys) {
    const raw = await fetchHashSafely(`analytics:${counterType}:${date}`);
    for (const [key, count] of Object.entries(raw)) {
      aggregated[key] = (aggregated[key] || 0) + Number(count);
    }
  }

  // Convert to array and sort
  return Object.entries(aggregated)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get user type breakdown (visitor vs authenticated)
 */
async function getUserTypes(dateRange: DateRange): Promise<{ visitor: number; authenticated: number }> {
  let visitors = 0;
  let authenticated = 0;

  for (const date of dateRange.dateKeys) {
    const raw = await fetchHashSafely(`analytics:usertype_counts:${date}`);
    visitors += Number(raw.visitor || 0);
    authenticated += Number(raw.authenticated || 0);
  }

  return { visitor: visitors, authenticated };
}

/**
 * Get day of week data with proper ordering
 */
async function getDayOfWeekData(dateRange: DateRange): Promise<AggregatedData> {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const aggregated: Record<string, number> = {};

  // Initialize all days to 0
  dayOrder.forEach(day => {
    aggregated[day] = 0;
  });

  // Aggregate data
  for (const date of dateRange.dateKeys) {
    const raw = await fetchHashSafely(`analytics:dayofweek_counts:${date}`);
    for (const [day, count] of Object.entries(raw)) {
      if (dayOrder.includes(day)) {
        aggregated[day] = (aggregated[day] || 0) + Number(count);
      }
    }
  }

  // Return in proper day order
  return dayOrder.map(day => ({
    name: day,
    count: aggregated[day]
  }));
}

/**
 * Add percentage calculations to data arrays
 */
function addPercentages<T extends { name: any; count: number }>(
  data: T[],
  total: number
): Array<T & { percentage: number }> {
  if (total === 0) return data.map(item => ({ ...item, percentage: 0 }));
  
  return data.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100)
  }));
}

/**
 * Get empty stats structure for error cases
 */
function getEmptyStats(): TrafficStats {
  return {
    visitors: { totalVisits: 0, dailyVisits: [] },
    pages: [],
    devices: [],
    userTypes: { visitor: 0, authenticated: 0 },
    hourlyVisits: [],
    timezoneHourlyVisits: [],
    dayOfWeekVisits: [],
    browsers: [],
    oses: [],
    deviceTypes: [],
    timezones: [],
    languages: [],
    browserDevices: [],
    browserDevicesDetailed: [],
    platformDevices: [],
    fullCombinations: []
  };
}

/**
 * Get recent raw visits for debugging (optional utility function)
 */
export async function getRecentVisits(limit: number = 100): Promise<any[]> {
  try {
    const visits = await redis.lRange('analytics:visits', -limit, -1);
    return visits.map(visit => JSON.parse(visit));
  } catch (err) {
    logger.error('[getRecentVisits] Failed to fetch recent visits', err);
    return [];
  }
}