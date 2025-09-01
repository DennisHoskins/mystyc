'use client'

import { useState, useEffect, useCallback } from 'react';
import { Drama } from 'lucide-react';

import { EnergyType, SignInteractionComplete, ZodiacSignType } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useUser } from '@/components/ui/context/AppContext';
import { getSignInteraction } from '@/server/actions/astrology';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import MystycTitle from '../../../ui/MystycTitle';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import MystycError from '../../../ui/MystycError';
import RadialGauge from '@/components/mystyc/ui/RadialGauge';
import LinearGauge from '@/components/mystyc/ui/LinearGauge';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import DynamicDetailsPanel from './DynamicDetailsPanel';
import ElementInteractionCard from './ElementInteractionCard';
import ModalityInteractionCard from './ModalityInteractionCard';
import PolarityInteractionCard from './PolarityInteractionsCard';
import EnergyTypesPanel from '@/components/mystyc/ui/EnergyTypesPanel';
import KeywordsPanel from './KeywordsPanel';

const getDistanceLabel = (distance: number): string => {
  const distanceMap: Record<number, { numeral: string; name: string }> = {
    0: { numeral: 'Ⅰ', name: 'Conjunction' },
    1: { numeral: 'Ⅱ', name: 'Semisextile (30°)' },
    2: { numeral: 'Ⅲ', name: 'Sextile (60°)' },
    3: { numeral: 'Ⅳ',name: 'Square (90°)' },
    4: { numeral:  'Ⅴ',name: 'Trine (120°)' },
    5: { numeral:  'Ⅵ', name: 'Quincunx (150°)' },
    6: { numeral: 'Ⅶ', name: 'Opposition (180°)' }
  };
  
  const distanceInfo = distanceMap[distance];
  return distanceInfo ? `${distanceInfo.numeral} - ${distanceInfo.name}` : `${distance}`;
};

export default function RelationshipPage({ sign } : { sign: ZodiacSignType }) {
  const user = useUser();
  const [interaction, setInteraction] = useState<SignInteractionComplete | null>();
  const [error, setError] = useState<string | null>(null);

  const loadInteraction = useCallback(async (sign: ZodiacSignType) => {
    if (!user || !user.userProfile.astrology) {
      return;
    }
    try {
      setError(null);
      const interaction = await getSignInteraction({deviceInfo: getDeviceInfo(), sign1: user.userProfile.astrology.sunSign, sign2: sign});
      setInteraction(interaction);
    } catch (err) {
      logger.error('Failed to load sign interaction:', err);
      setError('There was a problem loading compatability. Please try again.');
    }
  }, [user]);

  useEffect(() => {
    loadInteraction(sign);
  }, [loadInteraction, sign]);

  if (!user || !user.userProfile.astrology || !interaction) {
    return null;
  }

  console.log(interaction);

  if (error) {
    return (
      <div className='w-full flex flex-col space-y-4'>
        <MystycTitle
          icon={<Drama className='w-14 h-14 text-white' />}
          heading='Relationships'
          href='/relationships'
          title={user.userProfile.astrology?.sunSign}
          subtitle={`Explore Your Cosmic Chemistry`}
        />
        <Card>
          <Panel className='items-center'>
            <MystycError 
              title={`Sorry, ${user.userProfile.astrology.sunSign} :(`}
              error={error}
              onRetry={() => loadInteraction(sign)}
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
        href='/relationships'
        title={user.userProfile.astrology?.sunSign}
        titleIcon={getZodiacIcon(user.userProfile.astrology?.sunSign, 'w-6 h-6 text-gray-400')}
        subtitle={`How do the stars shape your connections?`}
      />
      <div className='grid grid-cols-4 gap-4'>
        <Panel className='flex-col justify-center'>
          <RadialGauge label='Compatible' size={150}  totalScore={interaction?.totalScore} />
          <div className='flex flex-col !mt-10'>
            <LinearGauge score={interaction.dynamicScore} label="Dynamic" />
            <LinearGauge score={interaction.elementScore} label="Element" />
            <LinearGauge score={interaction.modalityScore} label="Modality" />
            <LinearGauge score={interaction.polarityScore} label="Polarity" />
          </div>
        </Panel>
        <Card className='!p-10 col-span-3'>
          <Link href={`/signs/${interaction.sign2}`} className='flex items-center space-x-2 hover:!no-underline'>
            {getZodiacIcon(interaction.sign2, 'w-10 h-10 text-gray-300')}
            <Heading level={1}>{interaction.sign2}</Heading>
          </Link>

          <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
            {interaction.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
          </Text>

          <Text variant='muted' className="!text-gray-400 flex space-x-2 !mt-2">
            {getDistanceLabel(interaction.distance)}
          </Text>

          <Text variant='muted' className="!text-gray-400 !mt-2">{interaction.description}</Text>

          <Text variant='xs' className="!text-gray-500 !mt-2">Keys to success</Text>
          <Text variant='muted' className="!text-gray-400 !mb-4">{interaction.action}</Text>

          <DynamicDetailsPanel dynamic={interaction.dynamicData} score={interaction.dynamicScore} />
        </Card>
      </div>
      <div className='grid grid-cols-5 gap-4 !mt-4'>
        <div className='col-span-3 space-y-4'>
          <ElementInteractionCard interaction={interaction} />
          <ModalityInteractionCard interaction={interaction} />
          <PolarityInteractionCard interaction={interaction} />
        </div>
        <div className='col-span-2 flex flex-col space-y-4'>
          <EnergyTypesPanel 
            energyTypes={[
              interaction.energyTypeData as EnergyType,
              interaction.elementInteractionData?.energyTypeData as EnergyType,
              interaction.modalityInteractionData?.energyTypeData as EnergyType,
              interaction.polarityInteractionData?.energyTypeData as EnergyType,
              interaction.sign1Data.energyTypeData as EnergyType,
              interaction.sign2Data.energyTypeData as EnergyType,
            ]} 
          />
          <KeywordsPanel interaction={interaction} />
        </div>
      </div>
    </div>
  )
}
