import { SunMoon } from 'lucide-react';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function FeaturesInsights() {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex space-x-2 items-center'>
        <SunMoon className='w-9 h-9 -mt-1 text-white' />
        <Heading level={1}>Daily Insights</Heading>
      </div>
      <Text variant='muted' color='text-gray-400' className='font-bold'>
        Get daily guidance based on your unique birth chart and current planetary movements
      </Text>
      <Text variant='muted'>
        Find out how cosmic energy patterns influence your mood, decision-making, and opportunities throughout the day, with practical insights for navigating challenges and maximizing favorable moments.
      </Text>
    </div>
  );
}