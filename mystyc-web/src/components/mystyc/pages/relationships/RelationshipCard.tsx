'use client'

import { SignInteraction } from 'mystyc-common';
import Card from '@/components/ui/Card';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Panel from '@/components/ui/Panel';
import CompatibilityGauge from './CompatibilityGauge';
import LinearGauge from './LinearGauge';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import { formatStringForDisplay } from '@/util/util';

const getDistanceLabel = (distance: number): string => {
  const distanceMap: Record<number, { numeral: string; name: string }> = {
    0: { numeral: 'I', name: 'Conjunction' },
    1: { numeral: 'II', name: 'Semisextile (30°)' },
    2: { numeral: 'III', name: 'Sextile (60°)' },
    3: { numeral: 'IV', name: 'Square (90°)' },
    4: { numeral: 'V', name: 'Trine (120°)' },
    5: { numeral: 'VI', name: 'Quincunx (150°)' },
    6: { numeral: 'VII', name: 'Opposition (180°)' }
  };
  
  const distanceInfo = distanceMap[distance];
  return distanceInfo ? `${distanceInfo.numeral} - ${distanceInfo.name}` : `${distance}`;
};

export default function RelationshipCard({ interaction } : { interaction: SignInteraction }) {
  return (
    <Card className='!p-10'>

      <div className='flex items-center space-x-2'>
        {getZodiacIcon(interaction.sign2, 'w-10 h-10 text-gray-300')}
        <Heading level={1}>{interaction.sign2}</Heading>
        <Text variant='small' className="!text-gray-500 !mt-2 !ml-3 flex space-x-2">
          {getDistanceLabel(interaction.distance)}
        </Text>
      </div>

      <div className='grid grid-cols-4 gap-6 !mt-2'>
        <Panel>
          <CompatibilityGauge totalScore={interaction.totalScore} />
          <div className="flex flex-col space-y-3 !mt-4">
            <LinearGauge score={interaction.dynamicScore} label="Dynamic" />
            <LinearGauge score={interaction.elementScore} label="Element" />
            <LinearGauge score={interaction.modalityScore} label="Modality" />
          </div>
        </Panel>

        <div className='col-span-3'>
          <div className='flex items-center space-x-2'>
            <Heading level={2} className='!text-gray-300'>{formatStringForDisplay(interaction.dynamic)}</Heading>
            {getDynamicIcon(interaction.dynamic, 'w-4 h-4 text-gray-300')}
          </div>
          <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
            {interaction.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
          </Text>
          <Text variant='muted' className="!text-gray-400 mt-2">{interaction.description}</Text>
          <Text variant='xs' className="!text-gray-500 mt-4">Keys to success</Text>
          <Text variant='muted' className="!text-gray-400">{interaction.action}</Text>
        </div>
      </div>
    </Card>
  )
}