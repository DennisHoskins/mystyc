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
  energy: DailyEnergy;
  summary: MonthlyAstronomicalSummary;
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
    <Card className='flex flex-col !p-4 md:!p-10'>
      <div className='flex items-center hover:!no-underline'>
        <MoonPhaseIcon 
          {...getMoonPhaseForDate(new Date(energy.date), summary)} 
          size={16} 
          color="#FFFFFF" 
        />
        <Heading level={2} className='!text-white ml-2'>{getDayLabel(energy.date)}</Heading>
        {getMoonPhaseForExactDate(energy.date, summary) && (
          <Text variant='xs' className='text-gray-500 !mt-2 ml-2 hidden md:block'>
            {getMoonPhaseForExactDate(energy.date, summary)!.phase}
          </Text>
        )}
      </div>

      {getMoonPhaseForExactDate(energy.date, summary) && (
        <Text variant='xs' className='text-gray-500 md:hidden'>
          {getMoonPhaseForExactDate(energy.date, summary)!.phase}
        </Text>
      )}

      {getEventsForDate(energy.date, summary).map((event, index) => (
        <Text key={index} className='!mt-1 text-gray-300'>
          {event.name}
        </Text>
      ))}      

      <div className='!mt-2 flex'>
        <Panel className='!p-4 items-center justify-center max-w-32 mr-4'>
          <Text variant='small' className='flex items-center'>{energy.date}</Text>
          <RadialGauge label='' size={100} totalScore={energy.personalTotalScore} inline={true} />
        </Panel>

        <div className='flex flex-col w-full !max-w-sm'>
          <div className='flex items-center w-full'>
            {getZodiacIcon(energy.planets.sun.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={`Sun - ${energy.planets.sun.sign}`}score={energy.planets.sun.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {getZodiacIcon(energy.planets.moon.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={`Moon - ${energy.planets.moon.sign}`} score={energy.planets.moon.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {getZodiacIcon(energy.planets.rising.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={`Rising - ${energy.planets.rising.sign}`} score={energy.planets.rising.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {getZodiacIcon(energy.planets.venus.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={`Venus - ${energy.planets.venus.sign}`} score={energy.planets.venus.personalScore} />
          </div>
          <div className='flex items-center w-full'>
            {getZodiacIcon(energy.planets.mars.sign, 'w-10 h-10 !text-gray-400 mr-4')}  
            <LinearGauge label={`Mars - ${energy.planets.mars.sign}`} score={energy.planets.mars.personalScore} />
          </div>
        </div>
      </div>
   </Card>
  );
}