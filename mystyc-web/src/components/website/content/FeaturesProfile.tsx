import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import UserStar from '@/components/ui/icons/UserStar';

export default function FeaturesProfile() {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex space-x-2 self-end'>
        <UserStar width={31} height={31} className='text-white' />
        <Heading level={1}>Personal Star Profile</Heading>
      </div>
      <Text variant='muted' color='text-gray-400' className='font-bold text-right'>
        Dive deep into your comprehensive birth chart analysis
      </Text>
      <Text variant='muted' className='text-right'>
        Uncover the meaning behind your sun, moon, rising, venus and mars signs.
        Explore how planetary positions at your birth reflect personality traits, emotional patterns, and relationship dynamics. 
        Learn about your astrological houses and what they reveal about different life areas.
      </Text>
    </div>
  );
}