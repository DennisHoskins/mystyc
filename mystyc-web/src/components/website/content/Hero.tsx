'use client'

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Hero() {
 const router = useTransitionRouter();

 return (
  <div className='mt-[20%] lg:mt-[7.5%] mb-[10%] !flex-row max-w-content'>
    <div className="text-center flex justify-center">
      <div className='flex flex-col'>
        <Heading level={1} className="mt-20 mb-6 text-4xl md:text-7xl flex flex-col justify-center items-center">
          mystyc
        </Heading>
        <Heading level={1} className="mb-6">
          Let The Stars Be Your Guide
        </Heading>
        <Text color='text-gray-400' className="mb-8 text-lg md:text-xl max-w-2xl mx-auto">
          Welcome to Astrology for the modern age. <br className='lg:hidden' />Discover what the stars have to say about you and your place in the Universe.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => router.push('/register', false)} className="text-lg px-8 py-3">
            Get Started Free
          </Button>
          <Button variant="secondary" onClick={() => router.push('/login', false)} className="text-lg px-8 py-3">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  </div>
 );
}