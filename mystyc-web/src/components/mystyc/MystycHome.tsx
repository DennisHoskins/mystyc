'use client'

import { useState, useEffect, useCallback }  from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { getSign, SignWithRelatedData } from '@/server/actions/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import Panel from '../ui/Panel';
import MystycError from './ui/MystycError';
import Link from '../ui/Link';
import ConstellationPanel from '@/components/mystyc/ui/ConstellationPanel';
import HoroscopePanel from '@/components/mystyc/pages/home/HoroscopePanel';
import CoreIdentityPanel from '@/components/mystyc/pages/home/CoreIdentityPanel';
import EmotionalExpressionPanel from '@/components/mystyc/pages/home/EmotionalExpressionPanel';
import RelationshipsPanel from '@/components/mystyc/pages/home/RelationshipsPanel';

export default function CorePage({ user } : { user: AppUser }) {
  const [sign, setSign] = useState<SignWithRelatedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSign = useCallback(async (user: AppUser) => {
    if (!user || !user.userProfile.astrology) {
      return;
    }
    try {
      const signData = await getSign({ deviceInfo: getDeviceInfo(), sign: user.userProfile.astrology.sunSign });
      setSign(signData);
    } catch(err) {
      setError("There was a problem loading your profile. Please try again.")      
    }
  }, [user]);

  useEffect(() => {
    loadSign(user);
  }, [user])

  if (!user || !user.userProfile.astrology) {
    return (
      <div className='w-full h-full space-y-10 flex flex-col'>
        <div className='flex space-x-10'>
          <Card className='w-full h-full'>
            <Panel className='items-center'>
              <MystycError 
                title={`Sorry, ${user.userProfile.firstName} :(`}
                error={"There was a problem loading your profile. Please try again."}
                onRetry={() => loadSign(user)}
              />
            </Panel>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-full space-y-10 flex flex-col'>
        <div className='flex space-x-10'>
          <Card className='w-full h-full'>
            <ConstellationPanel 
              sign={user.userProfile.astrology.sunSign} 
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
    <div className='w-full h-full space-y-10 flex flex-col'>
      <div className='flex space-x-10'>
        <Card>
          <Link href={`/${user.userProfile.astrology.sunSign}`}>
            <ConstellationPanel 
              sign={user.userProfile.astrology.sunSign} 
              showLabel={true} 
            />
          </Link>
        </Card>
        <Card className='w-full'>
          <HoroscopePanel user={user} sign={sign} />
        </Card>
      </div>
      <div className='grow grid grid-cols-3 gap-10'>
        <Card>
          <CoreIdentityPanel user={user} />
        </Card>
        <Card>
          <EmotionalExpressionPanel user={user} />
        </Card>
        <Card>
          <RelationshipsPanel user={user} />
        </Card>
      </div>
    </div>
  );
}
