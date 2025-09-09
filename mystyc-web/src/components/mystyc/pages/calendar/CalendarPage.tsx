'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDays } from "lucide-react";

import { DailyEnergyRangeResponse } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces';
import { getWeeklyEnergy } from '@/server/actions/insights';
import { getDeviceInfo } from '@/util/getDeviceInfo';
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

export default function CalendarPage() {
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
        date: startDate
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

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return dayName;
  }

console.log(energy)

  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<CalendarDays strokeWidth={1.5} className='w-10 h-10 mr-2 text-white' />}
          heading='Calendar'
          title={fullDate}
          subtitle={`${deviceInfo.timezone}`}
        />
        <div className='grid grid-cols-4 gap-4 !mt-4'>
          <Panel className='justify-center'>
            <RadialGauge label='' inline={true} size={150} totalScore={energy.personalScoreTotal} />
            <div className='flex flex-col !mt-6'>
              <LinearGauge score={energy.days[0].personalTotalScore || 0} label={getDayLabel(energy.days[0].date)} />
              <LinearGauge score={energy.days[1].personalTotalScore || 0} label={getDayLabel(energy.days[1].date)} />
              <LinearGauge score={energy.days[2].personalTotalScore || 0} label={getDayLabel(energy.days[2].date)} />
              <LinearGauge score={energy.days[3].personalTotalScore || 0} label={getDayLabel(energy.days[3].date)} />
              <LinearGauge score={energy.days[4].personalTotalScore || 0} label={getDayLabel(energy.days[4].date)} />
              <LinearGauge score={energy.days[5].personalTotalScore || 0} label={getDayLabel(energy.days[5].date)} />
              <LinearGauge score={energy.days[6].personalTotalScore || 0} label={getDayLabel(energy.days[6].date)} />
            </div>
          </Panel>

          <Card className='col-span-3 !p-10'>
            <Panel className='flex-col justify-center'>
              <WeeklyEnergyChart data={energy} />
            </Panel>
            <div className='grid grid-cols-7 gap-2 !mt-2'>
              <DailySignPanel energy={energy.days[0]} />
              <DailySignPanel energy={energy.days[1]} />
              <DailySignPanel energy={energy.days[2]} />
              <DailySignPanel energy={energy.days[3]} />
              <DailySignPanel energy={energy.days[4]} />
              <DailySignPanel energy={energy.days[5]} />
              <DailySignPanel energy={energy.days[6]} />
            </div>
          </Card>
        </div>

        <div className='!mt-4 grid grid-cols-5 gap-4'>
          <div className='flex flex-col space-y-4 col-span-3'>
            <CalendarDayCard energy={energy.days[0]} />
            <CalendarDayCard energy={energy.days[1]} />
            <CalendarDayCard energy={energy.days[2]} />
            <CalendarDayCard energy={energy.days[3]} />
            <CalendarDayCard energy={energy.days[4]} />
            <CalendarDayCard energy={energy.days[5]} />
            <CalendarDayCard energy={energy.days[6]} />
          </div>
        </div>

      </div>
    </PageTransition>
  );
}