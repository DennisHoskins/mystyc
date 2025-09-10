'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SunMoon, CircleMinus, CirclePlus } from "lucide-react";

import { Horoscope } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces';
import { getInsights } from '@/server/actions/insights';
import { getDeviceInfo } from '@/util/getDeviceInfo';
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

  const loadInsights = useCallback(async (deviceInfo: DeviceInfo) => {
    try {
      const insights = await getInsights({deviceInfo, date: new Date()});
      setInsights(insights);
    } catch(err) {
      console.log(err);
      setError("Unable to load insights. Please try again.")
    }
  }, []);

  useEffect(() => {
    loadInsights(deviceInfo);
  }, [deviceInfo, loadInsights])

  if (!user.userProfile.astrology || !insights) {
    return null;
  }

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
            icon={<SunMoon strokeWidth={1.5} className='w-10 h-10 mr-2 text-white' />}
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
          icon={<SunMoon strokeWidth={1.5} className='w-10 h-10 mr-2 text-white' />}
          heading={dayOfWeek}
          title={fullDate}
          subtitle={`${deviceInfo.timezone}`}
        />
        <div className='grid grid-cols-4 gap-4 mt-4'>
          <Panel className='flex-col justify-center'>
            <Text variant='small' className='text-center mb-1'>Today&apos;s {user.userProfile.astrology.sun.sign} Energy</Text>
            <RadialGauge label='' inline={true} size={150} totalScore={insights?.personalChart.totalScore || 0} />
            <div className='flex flex-col !mt-6'>
              <LinearGauge score={insights?.personalChart.sun.totalScore || 0} label="Sun" />
              <LinearGauge score={insights?.personalChart.moon.totalScore || 0} label="Moon" />
              <LinearGauge score={insights?.personalChart.rising.totalScore || 0} label="Rising" />
              <LinearGauge score={insights?.personalChart.venus.totalScore || 0} label="Venus" />
              <LinearGauge score={insights?.personalChart.mars.totalScore || 0} label="Mars" />
            </div>
          </Panel>
          <Card className='!p-10 col-span-3'>
            <InsightsHeaderPanel insights={insights} />
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center font-bold'>
              <CirclePlus className='w-3 h-3 text-gray-300 mr-1'/>Today&apos;s Strengths
            </Text>
            <Text variant='muted' className="!text-gray-400 !mt-2">{insights.personalChart.summary?.strengths}</Text>
          </Panel>
          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center font-bold'>
              <CircleMinus className='w-3 h-3 text-gray-300 mr-1'/>Today&apos;s Challenges
            </Text>
            <Text variant='muted' className="!text-gray-400 !mt-2">{insights.personalChart.summary?.challenges}</Text>
          </Panel>
        </div>

        <div className='grid grid-cols-5 gap-4 mt-4'>
          <div className='col-span-3 flex flex-col space-y-4'>
            <InsightInterationCard 
              planet="Sun" 
              cosmicChart={insights.cosmicChart.sun} 
              personalChart={insights.personalChart.sun} 
            />
            <InsightInterationCard 
              planet="Moon" 
              cosmicChart={insights.cosmicChart.moon} 
              personalChart={insights.personalChart.moon} 
            />
            <InsightInterationCard 
              planet="Rising" 
              cosmicChart={insights.cosmicChart.rising} 
              personalChart={insights.personalChart.rising} 
            />
            <InsightInterationCard 
              planet="Venus" 
              cosmicChart={insights.cosmicChart.venus} 
              personalChart={insights.personalChart.venus} 
            />
            <InsightInterationCard 
              planet="Mars" 
              cosmicChart={insights.cosmicChart.mars} 
              personalChart={insights.personalChart.mars} 
            />
          </div>
          <div className='col-span-2 space-y-4'>
            <WeeklyEnergyPanel sign={user.userProfile.astrology.sun.sign}/>
            <StarChartPanel data={insights.cosmicChart} size={350} label='Today&apos;s Star Chart' />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}