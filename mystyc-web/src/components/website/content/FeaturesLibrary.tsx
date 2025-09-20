import { BookHeart } from 'lucide-react';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function FeaturesLibrary() {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex space-x-2'>
        <BookHeart className='h-8 w-8 text-white' />
        <Heading level={1}>Astrology <span className='hidden lg:inline-block'>Knowledge</span> Library</Heading>
      </div>
      <Text variant='muted' color='text-gray-400' className='font-bold'>
        Access in-depth resources covering foundational astrological concepts
      </Text>
      <Text variant='muted'>
        Learn about the 12 zodiac signs, planetary meanings, house systems, aspects, traditional interpretations and more, including:
      </Text>
    </div>
  );
}