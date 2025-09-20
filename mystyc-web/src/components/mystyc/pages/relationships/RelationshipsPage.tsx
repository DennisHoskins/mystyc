'use client'

import { useState, useEffect, useCallback } from 'react';
import { Drama } from 'lucide-react';

import { SignInteraction } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy, useUser } from '@/components/ui/context/AppContext';
import { getSignInteractions } from '@/server/actions/astrology';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import PageTransition from '@/components/ui/transition/PageTransition';
import MystycTitle from '../../ui/MystycTitle';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import MystycError from '../../ui/MystycError';
import RelationshipCardWide from './RelationshipCardWide';
import RelationshipCardTall from './RelationshipCardTall';
import RelationshipPanelSquare from './RelationshipPanelSquare';

export default function RelationshipsPage() {
  const user = useUser();
  const [interactions, setInteractions] = useState<SignInteraction[] | null>();
  const [error, setError] = useState<string | null>(null);
  const { setBusy } = useBusy();

  const loadInteractions = useCallback(async () => {
    if (!user || !user.userProfile.astrology) {
      return;
    }
    try {
      setBusy(2500);
      setError(null);
      const interactions = await getSignInteractions({deviceInfo: getDeviceInfo(), sign: user.userProfile.astrology.sun.sign});
      setInteractions(interactions);
    } catch (err) {
      logger.error('Failed to load sign interactions:', err);
      setError('There was a problem loading compatability. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [user, setBusy]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  if (!user || !user.userProfile.astrology) {
    return null;
  }

  if (error) {
    return (
      <PageTransition>
        <div className='w-full flex flex-col space-y-4'>
          <MystycTitle
            icon={<Drama strokeWidth={1.5} className='w-10 h-10 md:w-8 md:h-8 text-white' />}
            heading='Relationships'
            title={user.userProfile.astrology?.sun.sign}
            subtitle={`Discover How the Stars Shape Your Connections`}
          />
          <Card>
            <Panel className='items-center'>
              <MystycError 
                title={`Sorry, ${user.userProfile.astrology.sun.sign} :(`}
                error={error}
                onRetry={loadInteractions}
              />
            </Panel>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className='w-full flex flex-col space-y-4'>
        <MystycTitle
          icon={<Drama strokeWidth={1.5} className='w-10 h-10 md:w-8 md:h-8 text-white' />}
          heading='Relationships'
          title={user.userProfile.astrology?.sun.sign}
          titleIcon={getZodiacIcon(user.userProfile.astrology?.sun.sign, 'w-6 h-6 text-gray-400')}
          subtitle={`Discover How the Stars Shape Your Connections`}
        />
        <div className='flex flex-col space-y-4'>
          <RelationshipCardWide interaction={interactions && interactions[0]} />
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div className='md:col-span-3 flex flex-col space-y-4'>
              <RelationshipPanelSquare interaction={interactions && interactions[1]} />
              <RelationshipPanelSquare interaction={interactions && interactions[3]} />
              <RelationshipPanelSquare interaction={interactions && interactions[5]} />
            </div>
            
            <div className='md:col-span-2 flex flex-col space-y-4'>
              <RelationshipCardTall interaction={interactions && interactions[2]} />
              <RelationshipCardTall interaction={interactions && interactions[4]} className='flex-1 grow' />
            </div>

            <div className='md:col-span-2 flex flex-col space-y-4'>
              <RelationshipCardTall interaction={interactions && interactions[6]} />
              <RelationshipCardTall interaction={interactions && interactions[8]} className='flex-1 grow' />
            </div>

            <div className='md:col-span-3 flex flex-col space-y-4'>
              <RelationshipPanelSquare interaction={interactions && interactions[7]} />
              <RelationshipPanelSquare interaction={interactions && interactions[9]} />
              <RelationshipPanelSquare interaction={interactions && interactions[10]} />
            </div>

            <div className='md:col-span-5'>
              <RelationshipCardWide interaction={interactions && interactions[11]} />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
