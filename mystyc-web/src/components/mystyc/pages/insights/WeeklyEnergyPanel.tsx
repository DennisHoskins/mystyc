'use client'

import { useState, useEffect, useCallback } from 'react';

import { DailyEnergyRangeResponse } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getWeeklyEnergy } from '@/server/actions/insights';
import Panel from "@/components/ui/Panel";
import Link from '@/components/ui/Link';
import WeeklyEnergyChart from '../../ui/WeeklyEnergyChart';

export default function WeeklyEnergyPanel() {
  const [energy, setEnergy] = useState<DailyEnergyRangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyEnergy = useCallback(async () => {
    try {
      // Start 3 days ago so today is in the middle of the week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 3);
      
      const energy = await getWeeklyEnergy({
        deviceInfo: getDeviceInfo(), 
        date: startDate // Pass Date object directly
      });
      setEnergy(energy);
      setError(null);
    } catch(err) {
      console.log(err);
      setError("Unable to load energy. Please try again.")
    }
  }, []);

console.log(error);

  useEffect(() => {
    loadWeeklyEnergy();
  }, [loadWeeklyEnergy])

  return (
    <Panel>
      <Link href='/calendar' className='min-h-52'>
        {energy && <WeeklyEnergyChart data={energy} style={{ cursor: 'pointer' }} />}
      </Link>
    </Panel>
  );
}