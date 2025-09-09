import { DailyEnergy, DailyEnergyRangeResponse } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import LinearGauge from '../../ui/LinearGauge';
import RadialGauge from '../../ui/RadialGauge';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function CalendarDayCard({ energy } : { energy: DailyEnergy }) {

  const getDayLabel = (dayDate: string):string => {
    const [year, month, dayNum] = dayDate.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayLabel = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    return dayLabel;
  }

  return (
    <Card className='flex flex-col !p-10'>
      <div className='flex items-center hover:!no-underline'>
        <Heading level={2} className='!text-white ml-1'>{getDayLabel(energy.date)}</Heading>
      </div>
      <div className='!mt-2 max-w-md'>
        <LinearGauge label='' score={energy.personalTotalScore} />
      </div>
      <div className='grid grid-cols-5 gap-2 !mt-4'>
        <Panel className='!p-4 items-center justify-center'>
          <Text variant='small' className='flex items-center'>Sun {getZodiacIcon(energy.planets.sun.sign, 'w-4 h-4 !text-gray-400 ml-1')}</Text>
          <RadialGauge label='Sun' size={100} totalScore={energy.planets.sun.personalScore} inline={true} />
        </Panel>
        <Panel className='!p-4 items-center justify-center'>
          <Text variant='small' className='flex items-center'>Moon {getZodiacIcon(energy.planets.moon.sign, 'w-4 h-4 !text-gray-400 ml-1')}</Text>
          <RadialGauge label='Moon' size={100} totalScore={energy.planets.moon.personalScore} inline={true} />
        </Panel>
        <Panel className='!p-4 items-center justify-center'>
          <Text variant='small' className='flex items-center'>Rising {getZodiacIcon(energy.planets.rising.sign, 'w-4 h-4 !text-gray-400 ml-1')}</Text>
          <RadialGauge label='Rising' size={100} totalScore={energy.planets.rising.personalScore} inline={true} />
        </Panel>
        <Panel className='!p-4 items-center justify-center'>
          <Text variant='small' className='flex items-center'>Venus {getZodiacIcon(energy.planets.venus.sign, 'w-4 h-4 !text-gray-400 ml-1')}</Text>
          <RadialGauge label='Venus' size={100} totalScore={energy.planets.venus.personalScore} inline={true} />
        </Panel>
        <Panel className='!p-4 items-center justify-center'>
          <Text variant='small' className='flex items-center'>Mars {getZodiacIcon(energy.planets.mars.sign, 'w-4 h-4 !text-gray-400 ml-1')}</Text>
          <RadialGauge label='Mars' size={100} totalScore={energy.planets.mars.personalScore} inline={true} />
        </Panel>
      </div>
    </Card>
  );
}