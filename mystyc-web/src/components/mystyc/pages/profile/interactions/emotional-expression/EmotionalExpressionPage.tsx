'use client'

import { useState, useEffect, useCallback } from 'react';
import { HandHeart } from 'lucide-react';

import { AstrologyComplete, EnergyType, User } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { useBusy, useUser } from '@/components/ui/context/AppContext';
import { getUserAstrologyData } from '@/server/actions/user';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { useDataStore } from '@/store/dataStore';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import PageTransition from '@/components/ui/transition/PageTransition';
import MystycTitle from '@/components/mystyc/ui/MystycTitle';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import MystycError from '@/components/mystyc/ui/MystycError';
import PlanetInteractionPanel from '../PlanetInteractionPanel';
import PlanetInteractionCard from '../PlanetInteractionCard';
import EnergyTypesPanel from '@/components/mystyc/ui/EnergyTypesPanel';
import KeywordsPanel from '../../KeywordsPanel';
import ProfileElementsPanel from '../../ProfileElementsPanel';

export default function EmotionalExpressionPage() {
  const [astrologyData, setAstrologyData] = useState<{user: User, astrology: AstrologyComplete} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const { setBusy } = useBusy();

  // Cache hooks
  const { getCachedAstrology, cacheAstrology } = useDataStore();

  const loadAstrology = useCallback(async (user: AppUser) => {
    try {
      setBusy(2500);
      
      // Check cache first
      const cachedAstrology = getCachedAstrology();
      if (cachedAstrology) {
        setAstrologyData({
          user: user as User,
          astrology: cachedAstrology
        });
        setBusy(false);
        return;
      }

      // Cache miss - fetch from API
      const fetchedAstrologyData = await getUserAstrologyData(getDeviceInfo(), user as User);
      if (fetchedAstrologyData) {
        setAstrologyData(fetchedAstrologyData);
        // Cache the successful response
        cacheAstrology(fetchedAstrologyData.astrology);
      }
    } catch(err) {
      console.log(err);
      setError("Unable to load astrology information. Please try again.")
    } finally {
      setBusy(false);
    }
  }, [setBusy, getCachedAstrology, cacheAstrology]);

  useEffect(() => {
    if (!user) return;
    loadAstrology(user);
  }, [user, loadAstrology])

  if (!user || !user.userProfile.astrology) {
    return null;
  }

  if (error) {
    return (
      <PageTransition>
          <div className='w-full flex flex-col space-y-4'>
            <MystycTitle
              icon={<HandHeart width={34} height={34} strokeWidth={1.5} className='text-white' />}
              heading='Emotional Expression'
              title='Moon'
              titleIcon={getPlanetIcon("Moon", 'w-4 h-4 mr-1 text-gray-400')}
              subtitle='How your feelings shape the way you act'
            />
            <Card>
              <Panel className='items-center'>
                <MystycError
                  title={`Sorry, ${user.userProfile.astrology.sun.sign} :(`}
                  error={error}
                  onRetry={() => loadAstrology(user)}
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
          icon={<HandHeart width={34} height={34} strokeWidth={1.5} className='text-white' />}
          heading='Emotional Expression'
          title='Moon'
          titleIcon={getPlanetIcon("Moon", 'w-4 h-4 mr-1 text-gray-400')}
          subtitle='How your feelings shape the way you act'
        />
        <PlanetInteractionCard 
          planet='Moon'
          sign={astrologyData?.astrology.moon.sign} 
          total={astrologyData?.astrology.moon.totalScore} 
          totals={[
            {label: "Moon - Rising", total: astrologyData?.astrology.moon.interactions.rising.score},
            {label: "Moon - Venus", total: astrologyData?.astrology.moon.interactions.venus.score},
            {label: "Moon - Mars", total: astrologyData?.astrology.moon.interactions.mars.score}
          ]}
          postion={astrologyData?.astrology.moon.positionData} 
          data={astrologyData?.astrology.moon}
        />

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 !mt-4'>
          <div className='flex flex-col space-y-4 col-span-3'>
            <Card>
              <PlanetInteractionPanel heading='How emotions show up socially' planet1="Moon" planet2="Rising" score={astrologyData?.astrology.moon.interactions.rising.score} interaction={astrologyData?.astrology.planetaryInteractions['moon-rising']} />
            </Card>
            <Card>
              <PlanetInteractionPanel heading='Emotional needs vs relationship style' planet1="Moon" planet2="Venus" score={astrologyData?.astrology.moon.interactions.venus.score} interaction={astrologyData?.astrology.planetaryInteractions['moon-venus']} />
            </Card>
            <Card>
              <PlanetInteractionPanel heading='Feelings vs action impulses' planet1="Moon" planet2="Mars" score={astrologyData?.astrology.moon.interactions.mars.score} interaction={astrologyData?.astrology.planetaryInteractions['moon-mars']} />
            </Card>
          </div>
          <div className='flex flex-col space-y-4 col-span-2'>
            <ProfileElementsPanel elementData={astrologyData?.astrology.moon.signData.elementData ? [astrologyData?.astrology.moon.signData.elementData] : []} />
            <Panel className='col-span-3'>
              <EnergyTypesPanel
                energyTypes={[
                  astrologyData?.astrology.moon.positionData.energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['moon-rising'].energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['moon-venus'].energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['moon-mars'].energyTypeData as EnergyType,
                ]} 
              />
            </Panel>
            <KeywordsPanel
              keywords={[
                ...(astrologyData?.astrology.moon.positionData.keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["moon-rising"].keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["moon-venus"].keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["moon-mars"].keywords || []),
              ]}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}