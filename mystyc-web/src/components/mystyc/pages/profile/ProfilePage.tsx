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

  const aisummary = {
    "patterns": {
      "themes": [
        "Strong Pisces influence across identity, emotions, and relationships.",
        "Balance between softness (Pisces) and strength (Scorpio/Taurus).",
        "Recurring theme of 'water nourishes earth, earth contains water' — emotional depth paired with structure and persistence.",
        "Tension between change/flexibility (Pisces) and stability/consistency (Taurus/Scorpio)."
      ]
    },
    "strengths": [
      "High empathy and intuition.",
      "Creative and imaginative with artistic or spiritual depth.",
      "Persistent and able to follow through where others give up.",
      "Magnetic presence that attracts others naturally."
    ],
    "challenges": [
      "Can be overwhelmed by emotions (own or others’).",
      "Tendency to struggle with boundaries in relationships.",
      "Pulled between craving change and needing stability.",
      "Risk of reacting impulsively when emotions run high."
    ],
    "growth_path": [
      "Balance sensitivity with structure and boundaries.",
      "Learn when to adapt and when to hold steady.",
      "Channel persistence into turning dreams into tangible results.",
      "Pause before reacting to align emotions with conscious choices."
    ],
    "core_snapshot": "An empathetic, intuitive person who combines deep compassion with persistence and intensity. Strong creative and emotional sensitivity pairs with determination to build and sustain. Growth comes from balancing flexibility with grounding and learning to manage emotions without being consumed by them."    
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
            icon={<UserStar width={34} height={34} className='text-white mr-1' />}
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
          icon={<UserStar width={34} height={34} className='text-white mr-1' />}
          heading={user.name}
          title={formatDateForDisplay(user.userProfile.dateOfBirth, false) + " @ " + formatTime(user.userProfile.timeOfBirth)}
          subtitle={user.userProfile.birthLocation?.formattedAddress + " (" + user.userProfile.birthLocation?.coordinates.lat + " ° , " + user.userProfile.birthLocation?.coordinates.lng + " ° )"}
        />

        <div className='grid grid-cols-4 gap-4'>
          <Panel className='!p-4 justify-center'>
            <RadialGauge label='Profile Energy' totalScore={0.9} />
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
            <Text variant='muted' className="!text-gray-500 !mt-1">{aisummary.strengths.join(" ")}</Text>
          </Panel>

          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center'>
              <CircleMinus className='w-3 h-3 text-gray-300 mr-1'/>Challenges
            </Text>
            <Text variant='muted' className="!text-gray-500 !mt-1">{aisummary.challenges.join(" ")}</Text>
          </Panel>

          <Panel>
            <Text variant='muted' className='!text-gray-300 flex items-center'>
              <KeySquare className='w-3 h-3 text-gray-300 mr-1'/>Keys to Success
            </Text>
            <Text variant='muted' className="!text-gray-500 !mt-1">{aisummary.growth_path.join(" ")}</Text>
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
                score={user.userProfile.astrology.sun.totalScore}
                data={astrologyData.astrology.sun}
                totals={[
                  {label: "Sun - Moon", total: astrologyData.astrology.sun.interactions.moon.score},
                  {label: "Sun - Rising", total: astrologyData.astrology.sun.interactions.rising.score},
                  {label: "Sun - Venus", total: astrologyData.astrology.sun.interactions.venus.score},
                  {label: "Sun - Mars", total: astrologyData.astrology.sun.interactions.mars.score}
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/emotional-expression'
                heading='Emotional Expression'
                subheading='How your feelings shape the way you act'
                planet='Moon'
                score={user.userProfile.astrology.moon.totalScore}
                data={astrologyData.astrology.moon}
                totals={[
                  {label: "Moon - Rising", total: astrologyData.astrology.moon.interactions.rising.score},
                  {label: "Moon - Venus", total: astrologyData.astrology.moon.interactions.venus.score},
                  {label: "Moon - Mars", total: astrologyData.astrology.moon.interactions.mars.score}
                ]}
              />
            </Card>
            <Card className='!p-10'>
              <ProfileInteractionPanel 
                href='/profile/social-dynamics'
                heading='Social Dynamics'
                subheading='The ways your outer self connects with others'
                planet='Rising'
                score={user.userProfile.astrology.rising.totalScore}
                data={astrologyData.astrology.rising}
                totals={[
                  {label: "Rising - Venus", total: astrologyData.astrology.rising.interactions.venus.score},
                  {label: "Rising - Mars", total: astrologyData.astrology.rising.interactions.mars.score},
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
