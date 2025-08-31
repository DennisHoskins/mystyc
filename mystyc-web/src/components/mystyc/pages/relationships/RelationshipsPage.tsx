'use client'

import { useState, useEffect, useCallback } from 'react';
import { Drama } from 'lucide-react';

import { SignInteraction } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useUser } from '@/components/ui/context/AppContext';
import MystycTitle from '../../ui/MystycTitle';
import RelationshipCard from './RelationshipCard';
import { getSignInteractions } from '@/server/actions/astrology';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import MystycError from '../../ui/MystycError';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function RelationshipsPage() {
  const user = useUser();
  const [interactions, setInteractions] = useState<SignInteraction[] | null>();
  const [error, setError] = useState<string | null>(null);

  const loadInteractions = useCallback(async () => {
    if (!user || !user.userProfile.astrology) {
      return;
    }
    try {
      setError(null);
      const interactions = await getSignInteractions({deviceInfo: getDeviceInfo(), sign: user.userProfile.astrology.sunSign});
      setInteractions(interactions);
    } catch (err) {
      logger.error('Failed to load sign interactions:', err);
      setError('There was a problem loading compatability. Please try again.');
    }
  }, [user]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  if (!user || !user.userProfile.astrology) {
    return null;
  }

  console.log(interactions);

  if (error) {
    return (
      <div className='w-full flex flex-col space-y-4'>
        <MystycTitle
          icon={<Drama className='w-14 h-14 text-white' />}
          heading='Relationships'
          title={user.userProfile.astrology?.sunSign}
          subtitle={`Discover How the Stars Shape Your Connections`}
        />
        <Card>
          <Panel className='items-center'>
            <MystycError 
              title={`Sorry, ${user.userProfile.astrology.sunSign} :(`}
              error={error}
              onRetry={loadInteractions}
            />
          </Panel>
        </Card>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col space-y-4'>
      <MystycTitle
        icon={<Drama className='w-14 h-14 text-white' />}
        heading='Relationships'
        title={user.userProfile.astrology?.sunSign}
        titleIcon={getZodiacIcon(user.userProfile.astrology?.sunSign, 'w-6 h-6 text-gray-400')}
        subtitle={`How do the stars shape your connections?`}
      />
      <div className='flex flex-col space-y-4'>
        {interactions?.map((interaction, i) => (
          <RelationshipCard key={i} interaction={interaction} />
        ))}
      </div>
    </div>
  )
}
