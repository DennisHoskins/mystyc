'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDays } from "lucide-react";

import { DailyEnergyRangeResponse } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces';
import { getWeeklyEnergy } from '@/server/actions/insights';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import PageTransition from '@/components/ui/transition/PageTransition';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import MystycError from '../../ui/MystycError';
import MystycTitle from '../../ui/MystycTitle';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../.././ui/LinearGauge';
import WeeklyEnergyChart from '../../ui/WeeklyEnergyChart';

export default function CalendarPage({ user } : { user: AppUser }) {
  const [energy, setEnergy] = useState<DailyEnergyRangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  const loadWeeklyEnergy = useCallback(async (deviceInfo: DeviceInfo) => {
    try {
      // Start 3 days ago so today is in the middle of the week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 3);
      
      const energy = await getWeeklyEnergy({
        deviceInfo,
        date: startDate // Pass Date object directly
      });
      setEnergy(energy);
      setError(null);
    } catch(err) {
      console.log(err);
      setError("Unable to load energy. Please try again.")
    }
  }, []);

  useEffect(() => {
    loadWeeklyEnergy(deviceInfo);
  }, [loadWeeklyEnergy, deviceInfo])

  // Format current date
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (error) {
    return (
      <PageTransition>
        <div className='w-full flex flex-col space-y-4'>
          <MystycTitle
            icon={<CalendarDays strokeWidth={1.5} className='w-10 h-10 mr-2 text-white' />}
            heading='Calendar'
            title={fullDate}
            subtitle={`${deviceInfo.timezone}`}
          />
          <Card>
            <Panel className='items-center'>
              <MystycError
                title={`Sorry :(`}
                error={error}
                onRetry={() => loadWeeklyEnergy(deviceInfo)}
              />
            </Panel>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (!energy) {
    return null;
  }

  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<CalendarDays strokeWidth={1.5} className='w-10 h-10 mr-2 text-white' />}
          heading='Calendar'
          title={fullDate}
          subtitle={`${deviceInfo.timezone}`}
        />
        <div className='flex mt-4'>
          <Panel className='flex-col justify-center'>
            <WeeklyEnergyChart data={energy} />
          </Panel>
        </div>
     </div>
    </PageTransition>
  );
}