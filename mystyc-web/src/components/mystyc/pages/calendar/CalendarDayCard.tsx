import { DailyEnergy, MonthlyAstronomicalSummary } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import LinearGauge from '../../ui/LinearGauge';
import RadialGauge from '../../ui/RadialGauge';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import MoonPhaseIcon from '@/components/mystyc/ui/MoonPhaseIcon';
import { getMoonPhaseForDate, getMoonPhaseForExactDate, getEventsForDate } from '@/util/moonPhaseUtils';

interface CalendarDayCardProps {
  energy: DailyEnergy | null | undefined;
  summary: MonthlyAstronomicalSummary | null | undefined;
}

export default function CalendarDayCard({ energy, summary }: CalendarDayCardProps) {

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
    <Card className='flex flex-col'>
      <div className='flex items-center hover:!no-underline'>
        {energy &&
          <MoonPhaseIcon 
            {...getMoonPhaseForDate(new Date(energy.date), summary)} 
            size={16} 
            color="#FFFFFF" 
          />
        }
        <Heading level={2} color='text-white' className=' ml-2'>{energy && getDayLabel(energy.date)}</Heading>
        {(energy && summary) && getMoonPhaseForExactDate(energy.date, summary) && (
          <Text variant='xs' color='text-gray-500' className='!mt-2 ml-2 hidden md:block'>
            {getMoonPhaseForExactDate(energy.date, summary)!.phase}
          </Text>
        )}
      </div>

      {(energy && summary) && getMoonPhaseForExactDate(energy.date, summary) && (
        <Text variant='xs' color='text-gray-500' className='md:hidden'>
          {getMoonPhaseForExactDate(energy.date, summary)!.phase}
        </Text>
      )}

      {(energy && summary) && getEventsForDate(energy.date, summary).map((event, index) => (
        <Text key={index} color='text-gray-300' className='!mt-1'>
          {event.name}
        </Text>
      ))}      

      <div className='!mt-2 flex'>
        <Panel padding={4} className='items-center justify-center max-w-32 mr-4'>
          <Text variant='small' className='flex items-center'>{energy?.date}</Text>
          <RadialGauge label='' size={100} totalScore={energy ? energy.personalTotalScore : null} inline={true} />
        </Panel>

        <div className='flex flex-col w-full !max-w-sm'>
          <div className='flex items-center w-full'>
            {energy && getZodiacIcon(energy.planets.sun.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={energy && `Sun - ${energy.planets.sun.sign}`} score={energy?.planets.sun.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {energy && getZodiacIcon(energy.planets.moon.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={energy && `Moon - ${energy.planets.moon.sign}`} score={energy?.planets.moon.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {energy && getZodiacIcon(energy.planets.rising.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={energy && `Rising - ${energy.planets.rising.sign}`} score={energy?.planets.rising.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {energy && getZodiacIcon(energy.planets.venus.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={energy && `Venus - ${energy.planets.venus.sign}`} score={energy?.planets.venus.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {energy && getZodiacIcon(energy.planets.mars.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={energy && `Mars - ${energy.planets.mars.sign}`} score={energy?.planets.mars.personalScore} />
          </div>
        </div>
      </div>
   </Card>
  );
}