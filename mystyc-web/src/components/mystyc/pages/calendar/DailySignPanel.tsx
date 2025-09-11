import { DailyEnergy } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function DailySignPanel({ energy, today = false } : { energy: DailyEnergy, today?: boolean }) {

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dayLabel;
  }

  return (
      <Panel className='flex flex-col !p-4'>
        <Text variant='xs' className={`text-center mb-2 ${today ? '!text-white' : ''}`}>{getDayLabel(energy.date)}</Text>
        <Text variant='small' className={`flex items-center justify-between ${today ? '!text-white' : ''}`}>Sun {getZodiacIcon(energy.planets.sun.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`flex items-center justify-between ${today ? '!text-white' : ''}`}>Moon {getZodiacIcon(energy.planets.moon.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`flex items-center justify-between ${today ? '!text-white' : ''}`}>Rising {getZodiacIcon(energy.planets.rising.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`flex items-center justify-between ${today ? '!text-white' : ''}`}>Venus {getZodiacIcon(energy.planets.venus.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`flex items-center justify-between ${today ? '!text-white' : ''}`}>Mars {getZodiacIcon(energy.planets.mars.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
      </Panel>
  );
}