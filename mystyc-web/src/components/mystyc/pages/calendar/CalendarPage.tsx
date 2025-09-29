'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDays } from "lucide-react";

import { DailyEnergyRangeResponse } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces';
import { getWeeklyEnergy } from '@/server/actions/insights';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { useBusy, useUser } from '@/components/ui/context/AppContext';
import { useDataStore } from '@/store/dataStore';
import PageTransition from '@/components/ui/transition/PageTransition';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import MystycError from '../../ui/MystycError';
import MystycTitle from '../../ui/MystycTitle';
import WeeklyEnergyChart from '../../ui/WeeklyEnergyChart';
import RadialGauge from '../../ui/RadialGauge';
import DailySignPanel from './DailySignPanel';
import LinearGauge from '../../ui/LinearGauge';
import CalendarDayCard from './CalendarDayCard';
import Text from '@/components/ui/Text';
import UpcomingEvents from './UpcomingEvents';
import Calendar from './Calendar';

export default function CalendarPage() {
  const user = useUser();
  const [energy, setEnergy] = useState<DailyEnergyRangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const { setBusy } = useBusy();

  // Cache hooks
  const { getCachedWeeklyEnergy, cacheWeeklyEnergy } = useDataStore();

  const loadWeeklyEnergy = useCallback(async (deviceInfo: DeviceInfo) => {
    try {
      setBusy(2500);
      
      // Start 3 days ago so today is in the middle of the week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 3);

      // Check cache first
      const cachedEnergy = getCachedWeeklyEnergy(startDate, deviceInfo.timezone);
      if (cachedEnergy) {
        setEnergy(cachedEnergy);
        setBusy(false);
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
        cacheWeeklyEnergy(startDate, deviceInfo.timezone, fetchedEnergy);
      }
      setError(null);
    } catch(err) {
      console.log(err);
      setError("Unable to load energy. Please try again.")
    } finally {
      setBusy(false);
    }
  }, [setBusy, getCachedWeeklyEnergy, cacheWeeklyEnergy]);

  useEffect(() => {
    loadWeeklyEnergy(deviceInfo);
  }, [loadWeeklyEnergy, deviceInfo])

  // Format current date

  const timezone = deviceInfo.timezone;
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));      
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
            icon={<CalendarDays strokeWidth={1.5} className='w-10 h-10 text-white' />}
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

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return dayName;
  }

  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<CalendarDays strokeWidth={1.5} className='w-10 h-10 text-white' />}
          heading='Calendar'
          title={fullDate}
          subtitle={`${deviceInfo.timezone}`}
        />
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 !mt-4'>

          <Panel className='!flex-row md:!flex-col justify-center items-center'>
            <div>
              <Text variant='small' className='text-center mb-1'>Weekly {user?.userProfile.astrology?.sun.sign} Energy</Text>
              <RadialGauge label='' inline={true} size={150} totalScore={energy?.personalScoreTotal} />
            </div>
            <div className='flex flex-col ml-4 md:ml-0 md:!mt-4 w-full flex-1 md:flex-none pb-2'>
              <LinearGauge score={energy?.days[0].personalTotalScore} label={energy && getDayLabel(energy?.days[0].date)} />
              <LinearGauge score={energy?.days[1].personalTotalScore} label={energy && getDayLabel(energy?.days[1].date)} />
              <LinearGauge score={energy?.days[2].personalTotalScore} label={energy && getDayLabel(energy?.days[2].date)} />
              <LinearGauge score={energy?.days[3].personalTotalScore} label={energy && getDayLabel(energy?.days[3].date)} />
              <LinearGauge score={energy?.days[4].personalTotalScore} label={energy && getDayLabel(energy?.days[4].date)} />
              <LinearGauge score={energy?.days[5].personalTotalScore} label={energy && getDayLabel(energy?.days[5].date)} />
              <LinearGauge score={energy?.days[6].personalTotalScore} label={energy && getDayLabel(energy?.days[6].date)} />
            </div>
          </Panel>

          <Card className='md:col-span-3'>
            <Panel className='flex-col justify-center'>
              <WeeklyEnergyChart data={energy} date={today} />
            </Panel>
            <div className='grid-cols-1 md:grid-cols-7 gap-2 !mt-2 hidden md:grid'>
              <DailySignPanel energy={energy?.days[0]} />
              <DailySignPanel energy={energy?.days[1]} />
              <DailySignPanel energy={energy?.days[2]} />
              <DailySignPanel energy={energy?.days[3]} today={true} />
              <DailySignPanel energy={energy?.days[4]} />
              <DailySignPanel energy={energy?.days[5]} />
              <DailySignPanel energy={energy?.days[6]} />
            </div>
          </Card>
        </div>

        <div className='!mt-4 grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='flex flex-col space-y-4 md:col-span-3'>
            <CalendarDayCard energy={energy?.days[0]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[1]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[2]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[3]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[4]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[5]} summary={energy?.monthlyAstronomicalSummary} />
            <CalendarDayCard energy={energy?.days[6]} summary={energy?.monthlyAstronomicalSummary} />
          </div>

          <div className='flex flex-col md:col-span-2 space-y-4'>
            <Card>
              <Calendar summary={energy?.monthlyAstronomicalSummary} date={energy ? new Date(energy?.startDate) : null} />
            </Card>
            <UpcomingEvents summary={energy?.monthlyAstronomicalSummary} />
          </div>
        </div>

      </div>
    </PageTransition>
  );
}