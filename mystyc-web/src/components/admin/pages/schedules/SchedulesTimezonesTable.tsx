'use client'

import { useEffect, useCallback, useState } from 'react';

import { getTimezones } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

// Define the raw timezone data shape
interface TimezoneData {
  timezone: string;
  offsetHours: number;
}

// Extend with computed time fields
interface DisplayRow extends TimezoneData {
  utcTime: string;
  localTime: string;
}

export default function SchedulesTimeZonesTable() {
  const [timezones, setTimezones] = useState<TimezoneData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTimezones = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response: TimezoneData[] = await getTimezones({deviceInfo: getDeviceInfo()});
      setTimezones(response);
    } catch (err) {
      logger.error('Failed to load timeZones:', err);
      setError('Failed to load timeZones. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimezones();
  }, [loadTimezones]);

  if (error) {
    return (
      <AdminErrorPage
        title="Unable to load device timeZones"
        error={error}
        onRetry={loadTimezones}
      />
    );
  }

  // Compute display rows with current UTC and local times
  const now = new Date();
  const displayData: DisplayRow[] = timezones.map(({ timezone, offsetHours }) => ({
    timezone,
    offsetHours,
    utcTime: new Intl.DateTimeFormat(undefined, {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now),
    localTime: new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now),
  }));

  const columns: Column<DisplayRow>[] = [
    { key: 'timezone', header: 'Timezone' },
    { key: 'offsetHours', header: 'Offset (hrs)', align: 'right' },
    { key: 'utcTime', header: 'UTC Time', align: 'right' },
    { key: 'localTime', header: 'Local Time', align: 'right' },
  ];

  return (
      <AdminTable<DisplayRow>
        data={displayData}
        columns={columns}
        loading={loading}
        onRefresh={loadTimezones}
        emptyMessage="No Timezones found."
      />
  );
}