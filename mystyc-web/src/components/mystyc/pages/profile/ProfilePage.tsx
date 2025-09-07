'use client'

import { useState, useEffect, useCallback } from 'react';
import { CircleMinus, CirclePlus, KeySquare } from 'lucide-react';

import { AstrologyComplete, EnergyType, User } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { useUser } from '@/components/ui/context/AppContext';
import { formatDateForDisplay } from '@/util/dateTime';
import { getUserAstrologyData } from '@/server/actions/user';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import PageTransition from '@/components/ui/transition/PageTransition';
import MystycTitle from '../../ui/MystycTitle';
import UserStar from '@/components/ui/icons/UserStar';
import EnergyTypesPanel from '../../ui/EnergyTypesPanel';
import KeywordsPanel from './KeywordsPanel';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import MystycError from '../../ui/MystycError';
import ProfileHeaderPanel from './ProfileHeaderPanel';
import ProfileInteractionPanel from './ProfileInteractionPanel';
import ProfileElementsPanel from './ProfileElementsPanel';
import RadialGauge from '../../ui/RadialGauge';

export default function ProfilePage() {
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

  const formatTime = (time: string | undefined): string => {
    if (!time) return "12:00am";
    const [hoursStr, minutes = "00"] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // convert 0 → 12, 13 → 1, etc.
    return `${hours}:${minutes.padStart(2, "0")} ${suffix}`;
  };

  if (error) {
    return (
      <PageTransition>
        <div className='w-full flex flex-col space-y-4'>
        <MystycTitle
            icon={<UserStar width={34} height={34} strokeWidth={1.5} className='text-white mr-1' />}
            heading={user.name}
            title={formatDateForDisplay(user.userProfile.dateOfBirth, false) + " @ " + formatTime(user.userProfile.timeOfBirth)}
            subtitle={user.userProfile.birthLocation?.formattedAddress + " (" + user.userProfile.birthLocation?.coordinates.lat + " ° , " + user.userProfile.birthLocation?.coordinates.lng + " ° )"}
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
          icon={<UserStar width={34} height={34} strokeWidth={1.5} className='text-white mr-1' />}
          heading={user.name}
          title={formatDateForDisplay(user.userProfile.dateOfBirth, false) + " @ " + formatTime(user.userProfile.timeOfBirth)}
          subtitle={user.userProfile.birthLocation?.formattedAddress + " (" + user.userProfile.birthLocation?.coordinates.lat + " ° , " + user.userProfile.birthLocation?.coordinates.lng + " ° )"}
        />

        <div className='grid grid-cols-4 gap-4'>
          <Panel className='!p-4 justify-center'>
            <RadialGauge label='Profile Energy' totalScore={astrologyData.user.userProfile.astrology?.totalScore || 0} />
          </Panel>
          <Card className='!p-10 col-span-3'>
            <ProfileHeaderPanel user={astrologyData.user} astrology={astrologyData.astrology} />
          </Card>
        </div>

        <div className='grid grid-cols-3 gap-4 !mt-4'>
          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center'>
              <CirclePlus className='w-3 h-3 text-gray-300 mr-1'/>Strengths
            </Text>
            <Text variant='muted' className="!text-gray-500 !mt-1">{astrologyData.user.userProfile.astrology?.summary?.strengths}</Text>
          </Panel>

          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center'>
              <CircleMinus className='w-3 h-3 text-gray-300 mr-1'/>Challenges
            </Text>
            <Text variant='muted' className="!text-gray-500 !mt-1">{astrologyData.user.userProfile.astrology?.summary?.challenges}</Text>
          </Panel>

          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center'>
              <KeySquare className='w-3 h-3 text-gray-300 mr-1'/>Keys to Success
            </Text>
            <Text variant='muted' className="!text-gray-500 !mt-1">{astrologyData.user.userProfile.astrology?.summary?.action}</Text>
          </Panel>
        </div>

        <div className='grid grid-cols-5 gap-4 !mt-4'>
          <div className='flex flex-col space-y-4 col-span-3'>
            <Card className='!p-10'>
              <ProfileInteractionPanel
                href='/profile/core-identity'
                heading='Core Identity'
                subheading='The way your inner self meets your outer image'
                planet='Sun'
                score={astrologyData.user.userProfile.astrology?.sun.totalScore || 0}
                astrology={astrologyData?.user?.userProfile?.astrology?.sun}
                data={astrologyData.astrology.sun}
                totals={[
                  {label: "Sun - Moon", total: astrologyData.astrology.sun.interactions.moon.score, description: astrologyData.user.userProfile.astrology?.sun.interactions!.moon.description},
                  {label: "Sun - Rising", total: astrologyData.astrology.sun.interactions.rising.score, description: astrologyData.user.userProfile.astrology?.sun.interactions!.rising.description},
                  {label: "Sun - Venus", total: astrologyData.astrology.sun.interactions.venus.score, description: astrologyData.user.userProfile.astrology?.sun.interactions!.venus.description},
                  {label: "Sun - Mars", total: astrologyData.astrology.sun.interactions.mars.score, description: astrologyData.user.userProfile.astrology?.sun.interactions!.mars.description},
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/emotional-expression'
                heading='Emotional Expression'
                subheading='How your feelings shape the way you act'
                planet='Moon'
                data={astrologyData.astrology.moon}
                score={astrologyData.user.userProfile.astrology?.moon.totalScore || 0}
                astrology={astrologyData?.user?.userProfile?.astrology?.moon}
                totals={[
                  {label: "Moon - Rising", total: astrologyData.astrology.moon.interactions.rising.score, description: astrologyData.user.userProfile.astrology?.moon.interactions!.rising.description},
                  {label: "Moon - Venus", total: astrologyData.astrology.moon.interactions.venus.score, description: astrologyData.user.userProfile.astrology?.moon.interactions!.venus.description},
                  {label: "Moon - Mars", total: astrologyData.astrology.moon.interactions.mars.score, description: astrologyData.user.userProfile.astrology?.moon.interactions!.mars.description},
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/social-dynamics'
                heading='Social Dynamics'
                subheading='The ways your outer self connects with others'
                planet='Rising'
                data={astrologyData.astrology.rising}
                score={astrologyData.user.userProfile.astrology?.rising.totalScore || 0}
                astrology={astrologyData?.user?.userProfile?.astrology?.rising}
                totals={[
                  {label: "Rising - Venus", total: astrologyData.astrology.rising.interactions.venus.score, description: astrologyData.user.userProfile.astrology?.rising.interactions!.venus.description},
                  {label: "Rising - Mars", total: astrologyData.astrology.rising.interactions.mars.score, description: astrologyData.user.userProfile.astrology?.rising.interactions!.venus.description},
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/social-dynamics'
                heading='Social Dynamics'
                subheading='How you love'
                planet='Venus'
                score={astrologyData.astrology.venus.interactions.mars.score}
                data={astrologyData.astrology.venus}
                astrology={astrologyData?.user?.userProfile?.astrology?.venus}
                totals={[
                  {label: "Venus - Mars", total: astrologyData.astrology.venus.interactions.mars.score, description: astrologyData.user.userProfile.astrology?.venus.interactions!.mars.description},
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/social-dynamics'
                heading='Social Dynamics'
                subheading='How you take action'
                planet='Mars'
                score={astrologyData.astrology.venus.interactions.mars.score}
                data={astrologyData.astrology.mars}
                astrology={astrologyData?.user?.userProfile?.astrology?.mars}
              />
            </Card>
          </div>

          <div className='flex flex-col space-y-4 col-span-2'>
            <ProfileElementsPanel 
              elementData={[
                astrologyData.astrology.sun.signData.elementData!,
                astrologyData.astrology.moon.signData.elementData!,
                astrologyData.astrology.rising.signData.elementData!,
                astrologyData.astrology.venus.signData.elementData!,
                astrologyData.astrology.mars.signData.elementData!,
              ]}
            />
            <Panel className='!p-10 col-span-3'>
              <EnergyTypesPanel
                energyTypes={[
                  astrologyData.astrology.sun.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.moon.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.rising.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.venus.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.mars.positionData.energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['sun-moon'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['sun-rising'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['sun-venus'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['sun-mars'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['moon-rising'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['moon-venus'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['moon-mars'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['rising-venus'].energyTypeData as EnergyType,
                  astrologyData.astrology.planetaryInteractions['rising-mars'].energyTypeData as EnergyType,
                ]} 
              />
            </Panel>
            <KeywordsPanel
              keywords={[
                ...(astrologyData.astrology.sun.positionData.keywords || []),
                ...(astrologyData.astrology.moon.positionData.keywords || []),
                ...(astrologyData.astrology.rising.positionData.keywords || []),
                ...(astrologyData.astrology.venus.positionData.keywords || []),
                ...(astrologyData.astrology.mars.positionData.keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["sun-moon"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["sun-rising"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["sun-venus"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["sun-mars"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["moon-rising"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["moon-venus"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["moon-mars"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["rising-venus"].keywords || []),
                ...(astrologyData.astrology.planetaryInteractions["rising-mars"].keywords || []),
              ]}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
