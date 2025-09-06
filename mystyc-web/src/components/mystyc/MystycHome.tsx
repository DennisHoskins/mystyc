'use client'

import { SunMoon } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Card from '@/components/ui/Card';
import Panel from '../ui/Panel';
import OnboardingPage from './pages/onboard/OnboardPage';
import PageTransition from '../ui/transition/PageTransition';
import MystycTitle from './ui/MystycTitle';
import RadialGauge from './ui/RadialGauge';
import LinearGauge from './ui/LinearGauge';

export default function MystycHome({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return (
      <OnboardingPage user={user} />
    );
  }

  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<SunMoon className='w-10 h-10 mr-2 text-white' />}
          heading={`Wednesday`}
          title={`September 3, 2025`}
          subtitle={`Your personal map to the stars`}
        />
        <div className='grid grid-cols-4 gap-8 mt-4'>
          <Panel className='flex-col justify-center'>
            <RadialGauge label='Energy' size={150} totalScore={0.6} />
            <div className='flex flex-col !mt-6'>
              <LinearGauge score={0.39} label="Sun" />
              <LinearGauge score={0.7} label="Moon" />
              <LinearGauge score={-0.2} label="Rising" />
            </div>
          </Panel>
          <Card className='!p-10 col-span-3'>
            <></>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
