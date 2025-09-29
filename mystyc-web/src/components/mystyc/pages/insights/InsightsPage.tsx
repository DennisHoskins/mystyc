'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SunMoon, CircleMinus, CirclePlus, KeySquare } from "lucide-react";

import { Horoscope } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces';
import { getInsights } from '@/server/actions/insights';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { useDataStore } from '@/store/dataStore';
import { useBusy } from '@/components/ui/context/AppContext';
import PageTransition from '@/components/ui/transition/PageTransition';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import MystycError from '../../ui/MystycError';
import MystycTitle from '../../ui/MystycTitle';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../.././ui/LinearGauge';
import InsightsHeaderPanel from './InsightsHeaderPanel';
import InsightInterationCard from './InsightInteractionCard';
import WeeklyEnergyPanel from './WeeklyEnergyPanel';
import StarChartPanel from '../../ui/starchart/StarChartPanel';

export default function InsightsPage({ user } : { user: AppUser }) {
  const [insights, setInsights] = useState<Horoscope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const { setBusy } = useBusy();
  
  // Cache hooks
  const { getCachedInsights, cacheInsights } = useDataStore();

  const loadInsights = useCallback(async (deviceInfo: DeviceInfo) => {
    try {
      setBusy(2500);
      const today = new Date();
      
      // Check cache first
      const cachedInsights = getCachedInsights(today, deviceInfo.timezone);
      if (cachedInsights) {
        setInsights(cachedInsights);
        setBusy(false);
        return;
      }

      // Cache miss - fetch from API
      const fetchedInsights = await getInsights({deviceInfo, date: today});
      if (fetchedInsights) {
        setInsights(fetchedInsights);
        // Cache the successful response
        cacheInsights(today, deviceInfo.timezone, fetchedInsights);
      }
    } catch(err) {
      console.log(err);
      setError("Unable to load insights. Please try again.")
    } finally {
      setBusy(false);
    }
  }, [setBusy, getCachedInsights, cacheInsights]);

  useEffect(() => {
    loadInsights(deviceInfo);
  }, [setBusy, deviceInfo, loadInsights])

  if (!user.userProfile.astrology) {
    return null;
  }

  // Format current date
  const timezone = deviceInfo.timezone;
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));      
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
            icon={<SunMoon strokeWidth={1.5} className='w-10 h-10 text-white' />}
            heading={dayOfWeek}
            title={fullDate}
            subtitle={`${deviceInfo.timezone}`}
          />
          <Card>
            <Panel className='items-center'>
              <MystycError
                title={`Sorry, ${user.userProfile.astrology.sun.sign} :(`}
                error={error}
                onRetry={() => loadInsights(deviceInfo)}
              />
            </Panel>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<SunMoon strokeWidth={1.5} className='w-10 h-10 text-white' />}
          heading={dayOfWeek}
          title={fullDate}
          subtitle={`${deviceInfo.timezone}`}
        />
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4'>
          <Panel className='!flex-row lg:!flex-col justify-center items-center'>
            <div>
              <Text variant='small' className='text-center mb-1'>Today&apos;s {user.userProfile.astrology.sun.sign} Energy</Text>
              <RadialGauge label='' inline={true} size={150} totalScore={insights?.personalChart.totalScore} />
            </div>
            <div className='flex flex-col ml-4 lg:ml-0 lg:!mt-4 w-full flex-1 lg:flex-none'>
              <LinearGauge score={insights?.personalChart.sun.totalScore} label="Sun" />
              <LinearGauge score={insights?.personalChart.moon.totalScore} label="Moon" />
              <LinearGauge score={insights?.personalChart.rising.totalScore} label="Rising" />
              <LinearGauge score={insights?.personalChart.venus.totalScore} label="Venus" />
              <LinearGauge score={insights?.personalChart.mars.totalScore} label="Mars" />
            </div>
          </Panel>
          <Card className='lg:col-span-3'>
            <InsightsHeaderPanel insights={insights} />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Panel className="lg:hidden">
            <div className="flex items-center">
              <Text variant='muted' color='text-gray-300' className='flex items-center font-bold'>
                <KeySquare className="w-4 h-4 mr-2 text-white" />
                Key Insights
              </Text>
            </div>
            <Text variant='muted' color='text-gray-400' className="min-h-20" loadingHeight={15}>{insights?.personalChart.summary?.action}</Text>
          </Panel>

          <Panel>
            <Text variant='muted' color='text-gray-300' className='flex items-center font-bold'>
              <CirclePlus className='w-3 h-3 text-gray-300 mr-1'/>Today&apos;s Strengths
            </Text>
            <Text variant='muted' color='text-gray-400' className="!mt-2 min-h-20" loadingHeight={15}>{insights?.personalChart.summary?.strengths}</Text>
          </Panel>
          <Panel>
            <Text variant='muted' color='text-gray-300' className='flex items-center font-bold'>
              <CircleMinus className='w-3 h-3 text-gray-300 mr-1'/>Today&apos;s Challenges
            </Text>
            <Text variant='muted' color='text-gray-400' className="!mt-2 min-h-20" loadingHeight={15}>{insights?.personalChart.summary?.challenges}</Text>
          </Panel>
        </div>
        <div className='lg:hidden mt-4'>
          <StarChartPanel data={insights?.cosmicChart} size={350} label={fullDate} />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4'>
          <div className='lg:col-span-3 flex flex-col space-y-4'>
            <InsightInterationCard 
              planet="Sun" 
              cosmicChart={insights?.cosmicChart.sun} 
              personalChart={insights?.personalChart.sun} 
            />
            <InsightInterationCard 
              planet="Moon" 
              cosmicChart={insights?.cosmicChart.moon} 
              personalChart={insights?.personalChart.moon} 
            />
            <InsightInterationCard 
              planet="Rising" 
              cosmicChart={insights?.cosmicChart.rising} 
              personalChart={insights?.personalChart.rising} 
            />
            <InsightInterationCard 
              planet="Venus" 
              cosmicChart={insights?.cosmicChart.venus} 
              personalChart={insights?.personalChart.venus} 
            />
            <InsightInterationCard 
              planet="Mars" 
              cosmicChart={insights?.cosmicChart.mars} 
              personalChart={insights?.personalChart.mars} 
            />
          </div>
          <div className='lg:col-span-2 space-y-4'>
            <WeeklyEnergyPanel sign={user.userProfile.astrology.sun.sign}/>
            <div className='hidden lg:block'>
              <StarChartPanel data={insights?.cosmicChart} size={350} className='!aspect-auto' label='Today&apos;s Star Chart' />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}