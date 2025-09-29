import { DailyEnergy } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function DailySignPanel({ energy, today = false } : { energy: DailyEnergy | null | undefined, today?: boolean }) {

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dayLabel;
  }

  return (
      <Panel padding={4} className='flex flex-col'>
        <Text variant='xs' className={`text-center mb-2 ${today ? '!text-white' : ''}`}>{energy  && getDayLabel(energy.date)}</Text>
        <Text variant='small' className={`h-6 flex items-center justify-between ${today ? '!text-white' : ''}`}>Sun {energy && getZodiacIcon(energy.planets.sun.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`h-6 flex items-center justify-between ${today ? '!text-white' : ''}`}>Moon {energy && getZodiacIcon(energy.planets.moon.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`h-6 flex items-center justify-between ${today ? '!text-white' : ''}`}>Rising {energy && getZodiacIcon(energy.planets.rising.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`h-6 flex items-center justify-between ${today ? '!text-white' : ''}`}>Venus {energy && getZodiacIcon(energy.planets.venus.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
        <Text variant='small' className={`h-6 flex items-center justify-between ${today ? '!text-white' : ''}`}>Mars {energy && getZodiacIcon(energy.planets.mars.sign, `ml-1 w-6 h-6 ${today ? 'text-white' : 'text-gray-400'}`)}</Text>
      </Panel>
  );
}