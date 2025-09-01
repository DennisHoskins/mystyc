'use client'

import { useState, useEffect, useCallback } from 'react';
import { Drama } from 'lucide-react';

import { SignInteraction } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useUser } from '@/components/ui/context/AppContext';
import { getSignInteractions } from '@/server/actions/astrology';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
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

  if (!interactions) {
    return null;
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
        {(interactions && interactions.length == 12) &&
          <>
            <RelationshipCardWide interaction={interactions[0]} />
            <div className='grid grid-cols-5 gap-4'>
              
              <div className='col-span-3 flex flex-col space-y-4'>
                <RelationshipPanelSquare interaction={interactions[1]} />
                <RelationshipPanelSquare interaction={interactions[3]} />
                <RelationshipPanelSquare interaction={interactions[5]} />
              </div>
              
              <div className='col-span-2 flex flex-col space-y-4'>
                <RelationshipCardTall interaction={interactions[2]} />
                <RelationshipCardTall interaction={interactions[4]} className='flex-1 grow' />
              </div>

              <div className='col-span-2 flex flex-col space-y-4'>
                <RelationshipCardTall interaction={interactions[6]} />
                <RelationshipCardTall interaction={interactions[8]} className='flex-1 grow' />
              </div>

              <div className='col-span-3 flex flex-col space-y-4'>
                <RelationshipPanelSquare interaction={interactions[7]} />
                <RelationshipPanelSquare interaction={interactions[9]} />
                <RelationshipPanelSquare interaction={interactions[10]} />
              </div>

              <div className='col-span-5'>
                <RelationshipCardWide interaction={interactions[11]} />
              </div>
            </div>
          </>
        }     
      </div>
    </div>
  )
}
