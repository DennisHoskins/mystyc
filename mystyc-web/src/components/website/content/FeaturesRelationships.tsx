import { Drama } from 'lucide-react';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function FeaturesRelationships() {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex space-x-2'>
        <Drama className='w-8 h-8 text-white' />
        <Heading level={1}>Relationships &amp; Compatibility</Heading>
      </div>
      <Text variant='muted' className='font-bold !text-gray-400'>
        Analyze astrological dynamics between you and others
      </Text>
      <Text variant='muted'>
        Explore how different combinations of sun, moon, rising, venus and mars signs interact.
        Discover potential strengths and challenges in partnerships, and learn communication strategies based on astrological interpretations.
      </Text>
    </div>
  );
}