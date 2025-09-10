import { DailyEnergy } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function DailySignPanel({ energy } : { energy: DailyEnergy }) {

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dayLabel;
  }

  return (
      <Panel className='flex flex-col !p-4'>
        <Text variant='xs' className='text-center mb-2'>{getDayLabel(energy.date)}</Text>
        <Text variant='small' className='flex items-center justify-between'>Sun {getZodiacIcon(energy.planets.sun.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Moon {getZodiacIcon(energy.planets.moon.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Rising {getZodiacIcon(energy.planets.rising.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Venus {getZodiacIcon(energy.planets.venus.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
        <Text variant='small' className='flex items-center justify-between'>Mars {getZodiacIcon(energy.planets.mars.sign, 'ml-1 w-6 h-6 text-gray-400')}</Text>
      </Panel>
  );
}