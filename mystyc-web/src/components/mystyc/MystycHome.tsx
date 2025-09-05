'use client'

import { useState, useEffect, useCallback }  from 'react';
import { SunMoon } from 'lucide-react';

import { SignComplete } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { getSign } from '@/server/actions/astrology';
import { logger } from '@/util/logger';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import Panel from '../ui/Panel';
import MystycError from './ui/MystycError';
import OnboardingPage from './pages/onboard/OnboardPage';
import ConstellationPanel from '@/components/mystyc/ui/ConstellationPanel';
import PageTransition from '../ui/transition/PageTransition';
import MystycTitle from './ui/MystycTitle';
import RadialGauge from './ui/RadialGauge';
import LinearGauge from './ui/LinearGauge';

export default function MystycHome({ user } : { user: AppUser }) {
  const [sign, setSign] = useState<SignComplete | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSign = useCallback(async (user: AppUser) => {
    if (!user || !user.userProfile.astrology) {
      return;
    }

    try {
      const signData = await getSign({ deviceInfo: getDeviceInfo(), sign: user.userProfile.astrology.sun.sign });
      setSign(signData);
    } catch(err) {
      logger.error(err);
      setError("There was a problem loading your profile. Please try again.")      
    }
  }, []);

  useEffect(() => {
    loadSign(user);
  }, [user, loadSign])

  if (!user || !user.userProfile) {
    return (
      <div className='w-full h-full space-y-10 flex flex-col'>
        <div className='flex space-x-10'>
          <Card className='w-full h-full'>
            <Panel className='items-center'>
              <MystycError 
                title={`Sorry :(`}
                error={"There was a problem loading your profile. Please try again."}
                onRetry={() => loadSign(user)}
              />
            </Panel>
          </Card>
        </div>
      </div>
    );
  }

  if (!user.userProfile.astrology) {
    return (
      <OnboardingPage user={user} />
    );
  }

  if (error) {
    return (
      <div className='w-full h-full space-y-10 flex flex-col'>
        <div className='flex space-x-10'>
          <Card className='w-full h-full'>
            <ConstellationPanel 
              sign={user.userProfile.astrology.sun.sign} 
              showLabel={true} 
            />
            <Panel className='items-center'>
              <MystycError 
                title={`Sorry, ${user.userProfile.firstName} :(`}
                error={error}
                onRetry={() => loadSign(user)}
              />
            </Panel>
          </Card>
        </div>
      </div>
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
