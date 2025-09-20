'use client'

import { useState, useEffect, useCallback } from 'react';
import { Fingerprint } from 'lucide-react';

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

export default function CoreIdentityPage() {
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
            icon={<Fingerprint width={34} height={34} strokeWidth={1.5} className='text-white' />}
            heading='Core Identity'
            title='Sun'
            titleIcon={getPlanetIcon("Sun", 'w-4 h-4 mr-1 text-gray-400')}
            subtitle='The way your inner self meets your outer image'
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
          icon={<Fingerprint width={34} height={34} strokeWidth={1.5} className='text-white' />}
          heading='Core Identity'
          title='Sun'
          titleIcon={getPlanetIcon("Sun", 'w-4 h-4 mr-1 text-gray-400')}
          subtitle='The way your inner self meets your outer image'
        />
        <PlanetInteractionCard 
          planet='Sun'
          sign={astrologyData?.astrology.sun.sign} 
          total={astrologyData?.astrology.sun.totalScore} 
          totals={[
            {label: "Sun - Moon", total: astrologyData?.astrology.sun.interactions.moon.score},
            {label: "Sun - Rising", total: astrologyData?.astrology.sun.interactions.rising.score},
            {label: "Sun - Venus", total: astrologyData?.astrology.sun.interactions.venus.score},
            {label: "Sun - Mars", total: astrologyData?.astrology.sun.interactions.mars.score}
          ]}
          postion={astrologyData?.astrology.sun.positionData}
          data={astrologyData?.astrology.sun} 
        />

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 !mt-4'>
          <div className='flex flex-col space-y-4 md:col-span-3'>
            <Card>
              <PlanetInteractionPanel heading='Core self vs emotional needs' planet1="Sun" planet2="Moon" score={astrologyData?.astrology.sun.interactions.moon.score} interaction={astrologyData?.astrology.planetaryInteractions['sun-moon']} />
            </Card>
            <Card>
              <PlanetInteractionPanel heading='Inner identity vs outer presentation' planet1="Sun" planet2="Rising" score={astrologyData?.astrology.sun.interactions.rising.score} interaction={astrologyData?.astrology.planetaryInteractions['sun-rising']} />
            </Card>
            <Card>
              <PlanetInteractionPanel heading='Self-expression vs relationships/values' planet1="Sun" planet2="Venus" score={astrologyData?.astrology.sun.interactions.venus.score} interaction={astrologyData?.astrology.planetaryInteractions['sun-venus']} />
            </Card>
            <Card>
              <PlanetInteractionPanel heading='Identity vs drive/action' planet1="Sun" planet2="Mars" score={astrologyData?.astrology.sun.interactions.mars.score} interaction={astrologyData?.astrology.planetaryInteractions['sun-mars']} />
            </Card>
          </div>

          <div className='flex flex-col space-y-4 md:col-span-2'>
            <ProfileElementsPanel elementData={astrologyData?.astrology.sun.signData.elementData ? [astrologyData.astrology.sun.signData.elementData] : []} />
            <Panel className='col-span-3'>
              <EnergyTypesPanel
                energyTypes={[
                  astrologyData?.astrology.sun.positionData.energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['sun-moon'].energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['sun-rising'].energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['sun-venus'].energyTypeData as EnergyType,
                  astrologyData?.astrology.planetaryInteractions['sun-mars'].energyTypeData as EnergyType,
                ]} 
              />
            </Panel>

            <KeywordsPanel
              keywords={[
                ...(astrologyData?.astrology.sun.positionData.keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["sun-moon"].keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["sun-rising"].keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["sun-venus"].keywords || []),
                ...(astrologyData?.astrology.planetaryInteractions["sun-mars"].keywords || []),
              ]}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}