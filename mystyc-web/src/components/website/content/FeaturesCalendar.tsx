import { CalendarDays } from 'lucide-react';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function FeaturesCalendar() {
  return (
    <div className='flex flex-col space-y-2 col-span-2'>
      <div className='flex space-x-2 self-end'>
        <CalendarDays className='w-8 h-8 -mt-[2.5px] text-white' />
        <Heading level={1}>Cosmic Calendar</Heading>
      </div>
      <Text variant='muted' color='text-gray-400' className='font-bold text-right'>
        Stay informed about upcoming astrological events with your personal cosmic timeline
      </Text>
      <Text variant='muted' className='text-right'>
        Track new moons, full moons, planetary retrogrades, and major transits that influence collective and personal energy. 
        Plan ahead with monthly and weekly cosmic weather forecasts.
      </Text>
    </div>
  );
}