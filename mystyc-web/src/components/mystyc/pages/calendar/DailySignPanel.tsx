import { DailyEnergy, DailyEnergyRangeResponse } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function DailySignPanel({ energy } : { energy: DailyEnergy }) {
  return (
      <Panel className='flex flex-col !p-4'>
        <Text variant='small' className='flex items-center justify-between'>Sun {getZodiacIcon(energy.planets.sun.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Moon {getZodiacIcon(energy.planets.moon.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Rising {getZodiacIcon(energy.planets.rising.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Venus {getZodiacIcon(energy.planets.venus.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Mars {getZodiacIcon(energy.planets.mars.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
      </Panel>
  );
}