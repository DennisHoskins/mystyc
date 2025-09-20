'use client'

import { useState, useEffect, useCallback } from 'react';

import { DailyEnergyRangeResponse, ZodiacSignType } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getWeeklyEnergy } from '@/server/actions/insights';
import { useDataStore } from '@/store/dataStore';
import Panel from "@/components/ui/Panel";
import Link from '@/components/ui/Link';
import WeeklyEnergyChart from '../../ui/WeeklyEnergyChart';
import Text from '@/components/ui/Text';

export default function WeeklyEnergyPanel({ sign } : { sign: ZodiacSignType }) {
  const [energy, setEnergy] = useState<DailyEnergyRangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  // Cache hooks
  const { getCachedWeeklyEnergy, cacheWeeklyEnergy } = useDataStore();

  const loadWeeklyEnergy = useCallback(async () => {
    try {
      // Start 3 days ago so today is in the middle of the week
      const deviceInfo = getDeviceInfo();
      const timezone = deviceInfo.timezone;
      const todayDate = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));      
      setToday(todayDate);
      const startDate = new Date(todayDate);
      startDate.setDate(todayDate.getDate() - 3);
      
      // Check cache first
      const cachedEnergy = getCachedWeeklyEnergy(startDate, timezone);
      if (cachedEnergy) {
        setEnergy(cachedEnergy);
        return;
      }

      // Cache miss - fetch from API
      const fetchedEnergy = await getWeeklyEnergy({
        deviceInfo, 
        date: startDate
      });
      if (fetchedEnergy) {
        setEnergy(fetchedEnergy);
        // Cache the successful response
        cacheWeeklyEnergy(startDate, timezone, fetchedEnergy);
      }
      setError(null);
    } catch(err) {
      console.log(err);
      setError("Unable to load energy. Please try again.")
    }
  }, [getCachedWeeklyEnergy, cacheWeeklyEnergy]);

  useEffect(() => {
    loadWeeklyEnergy();
  }, [loadWeeklyEnergy])

  if (error) {
    return (
    <Panel>
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <Link href='/calendar' className='min-h-52 hover:!no-underline'>
        <Text variant='small' className='text-center mb-2'>This Week&apos;s {sign} Energy</Text>
        {energy && <WeeklyEnergyChart data={energy} date={today} style={{ cursor: 'pointer' }} />}
      </Link>
    </Panel>
  );
}