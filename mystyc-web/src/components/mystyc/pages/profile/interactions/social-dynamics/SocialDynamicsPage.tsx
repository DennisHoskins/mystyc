'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { AstrologyComplete, EnergyType, User } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { useUser } from '@/components/ui/context/AppContext';
import { getUserAstrologyData } from '@/server/actions/user';
import { getDeviceInfo } from '@/util/getDeviceInfo';
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

export default function SocialDynamicsPage() {
  const [astrologyData, setAstrologyData] = useState<{user: User, astrology: AstrologyComplete} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  const loadAstrology = useCallback(async (user: AppUser) => {
    try {
      const astrologyData = await getUserAstrologyData(getDeviceInfo(), user as User);
      setAstrologyData(astrologyData);
    } catch(err) {
      console.log(err);
      setError("Unable to load astrology information. Please try again.")
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadAstrology(user);
  }, [user, loadAstrology])

  if (!user || !user.userProfile.astrology || !astrologyData?.astrology) {
    return null;
  }

  if (error) {
    return (
      <PageTransition>
        <div className='w-full flex flex-col space-y-4'>
          <MystycTitle
            icon={<Atom width={34} height={34} className='text-white mr-1' />}
            heading='Social Dynamics'
            title='Rising'
            titleIcon={getPlanetIcon("Rising", 'w-4 h-4 mr-1 text-gray-400')}
            subtitle='The ways your outer self connects with others'
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
          icon={<Atom width={34} height={34} className='text-white mr-1' />}
          heading='Social Dynamics'
          title='Rising'
          titleIcon={getPlanetIcon("Rising", 'w-4 h-4 mr-1 text-gray-400')}
          subtitle='The ways your outer self connects with others'
        />
        <PlanetInteractionCard 
          planet='Rising'
          sign={astrologyData.astrology.rising.sign} 
          total={astrologyData.astrology.rising.totalScore} 
          totals={[
            {label: "Rising - Venus", total: astrologyData.astrology.rising.interactions.venus.score},
            {label: "Rising - Mars", total: astrologyData.astrology.rising.interactions.mars.score},
            {label: "Venus - Mars", total: astrologyData.astrology.venus.interactions.mars.score},
          ]}
          postion={astrologyData.astrology.rising.positionData} 
          data={astrologyData.astrology.rising}
        />

        <div className='grid grid-cols-5 gap-4 !mt-4'>
          <div className='flex flex-col space-y-4 col-span-3'>
            <Card className='!p-10'>
              <PlanetInteractionPanel heading='Public image vs attraction style' planet1="Rising" planet2="Venus" score={astrologyData.astrology.rising.interactions.venus.score} interaction={astrologyData.astrology.planetaryInteractions['rising-venus']} />
            </Card>
            <Card className='!p-10'>
              <PlanetInteractionPanel heading='Social presentation vs assertiveness' planet1="Rising" planet2="Mars" score={astrologyData.astrology.rising.interactions.mars.score} interaction={astrologyData.astrology.planetaryInteractions['rising-mars']} />
            </Card>
            <Card className='!p-10'>
              <PlanetInteractionPanel heading='Attraction vs pursuit/desire' planet1="Venus" planet2="Mars" score={astrologyData.astrology.venus.interactions.mars.score} interaction={astrologyData.astrology.planetaryInteractions['venus-mars']} />
            </Card>
          </div>
          <div className='flex flex-col space-y-4 col-span-2'>
            <ProfileElementsPanel elementData={[astrologyData.astrology.rising.signData.elementData!]} />
            <Panel className='!p-10 col-span-3'>
              <EnergyTypesPanel
                energyTypes={[
                  astrologyData.astrology.rising.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['rising-venus'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['rising-mars'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['venus-mars'].energyTypeData as EnergyType,
                ]} 
              />
            </Panel>
            <KeywordsPanel
              keywords={[
                ...(astrologyData.astrology.rising.positionData.keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["rising-venus"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["rising-mars"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["venus-mars"].keywords || []),
              ]}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
