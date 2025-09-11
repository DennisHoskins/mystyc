import { Activity, Atom, BookHeart, CalendarDays, Drama, Fingerprint, Gauge, HandHeart, HeartHandshake, Microscope, Satellite, SunMoon, UserStar } from 'lucide-react';

import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function Features() {
  return (
    <div className='flex flex-col'>
      <Heading level={1} className="text-center mb-8">
        Features
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <Panel>
          <Heading level={2} className='flex items-center'>
            <SunMoon className='w-6 h-6 mr-2' />
            Daily Horoscopes
          </Heading>
          <Text variant='body'>View personalized analytics about your habits, mood, and progress over time.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Gauge className='w-6 h-6 mr-2' />
            Insights Dashboard
          </Heading>
          <Text variant='body'>View personalized analytics about your habits, mood, and progress over time.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Activity className='w-6 h-6 mr-2' />
            Weekly Analytics
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <UserStar className='w-6 h-6 mr-2' />
            Personal Star Profile
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Satellite className='w-6 h-6 mr-2' />
            Scientifically Acurate
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Microscope className='w-6 h-6 mr-2' />
            AI Analysis and Summary
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Fingerprint className='w-6 h-6 mr-2' />
            Core Identity
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <HandHeart className='w-6 h-6 mr-2' />
            Emotional Expression
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Atom className='w-6 h-6 mr-2' />
            Social Dynamics
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <Drama className='w-6 h-6 mr-2' />
            Relationship Compatibility
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <CalendarDays className='w-6 h-6 mr-2' />
            Cosmic Calendar
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <BookHeart className='w-6 h-6 mr-2' />
            Astrological Reference Library
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

        <Panel>
          <Heading level={2} className='flex items-center'>
            <HeartHandshake className='w-6 h-6 mr-2' />
            Matchmaker
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>

     </div>
    </div>
  );
}