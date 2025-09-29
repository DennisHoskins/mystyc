import { MonthlyAstronomicalSummary } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import { Calendar } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import MoonPhaseIcon from '@/components/mystyc/ui/MoonPhaseIcon';

interface Event {
  date: string;
  name: string;
  type: 'moon_phase' | 'event';
  phase?: string;
}

export default function UpcomingEvents({ summary } : { summary: MonthlyAstronomicalSummary | null | undefined }) {

  const getAllEvents = (): Event[] => {
    const allEvents: Event[] = [];
    
    // Add moon phases
    summary?.moonPhases?.forEach(moonPhase => {
      allEvents.push({
        date: moonPhase.date,
        name: moonPhase.phase,
        type: 'moon_phase',
        phase: moonPhase.phase
      });
    });
    
    // Add other events
    summary?.events?.forEach(event => {
      allEvents.push({
        date: event.date!,
        name: event.name,
        type: 'event'
      });
    });
    
    // Sort by date
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const formatEventDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const events = getAllEvents();

  return (
    <div className='flex flex-col space-y-2'>
      {events.map((event, i) => (
        <Panel padding={4} key={i} className='flex flex-col'>
          <div className='flex space-x-4 items-center'>
            {event.type === 'moon_phase' ? (
              <MoonPhaseIcon 
                phase={event.phase as 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter'} 
                percent={0} 
                size={30} 
                color="#FFFFFF" 
              />
            ) : (
              <Calendar className='w-8 h-8 text-gray-300' />
            )}
            <div className='flex flex-col space-y-0'>
              <Text variant='muted'>{formatEventDate(event.date)}</Text>
              <Heading level={4}>{event.name}</Heading>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}