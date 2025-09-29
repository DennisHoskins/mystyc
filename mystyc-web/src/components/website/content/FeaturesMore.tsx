import { BriefcaseBusiness, Clover, HandHeart, Palette, Stethoscope } from 'lucide-react';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import IconEye from '@/components/ui/icons/IconEye';
import Link from '@/components/ui/Link';

export default function FeaturesMore() {
  return (
    <div className='flex-col space-y-6 mx-4'>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <HandHeart className='h-4 w-4 -mt-1 text-gray-400' />
          <Heading level={6} color='text-gray-400'>Most and Least Compatible</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          Find your perfect match! Learn which signs you are most and least likely to get along with
        </Text>
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <Clover className='h-4 w-4 -mt-1 text-gray-400' />
          <Heading level={6} color='text-gray-400'>Your Lucky Charms</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          Hack your life with your lucky numbers, colors, days, and times
        </Text>
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <BriefcaseBusiness className='h-4 w-4 -mt-1 text-gray-400' />
          <Heading level={6} color='text-gray-400'>Lifestyle Choices</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          Explore careers, hobbies, cuisines, and music genres with your specific vibe
        </Text>
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <Palette className='h-4 w-4 -mt-1 text-gray-400' />
          <Heading level={6} color='text-gray-400'>Aesthetic Styles</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          Find out how the universe can help you define your personal style
        </Text>
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <Stethoscope className='h-4 w-4 -mt-1 text-gray-400' />
          <Heading level={6} color='text-gray-400'>Health and Physicality</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          Learn about health challenges you may face, and exercise routines that can work for you
        </Text>
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-2 items-center'>
          <IconEye size={18} className='text-gray-400'/>
          <Heading level={6} color='text-gray-400'>Much More...</Heading>
        </div>
        <Text variant='small' color='text-gray-500'>
          <Link href='/register' useTransition={false}>Sign Up</Link> or <Link href='/login' useTransition={false}>Login</Link> to your free account to begin your cosmic journey
        </Text>
      </div>
    </div>
  );
}