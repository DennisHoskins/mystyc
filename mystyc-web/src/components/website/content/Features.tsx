import Image from 'next/image';

import Card from '@/components/ui/Card';
import FeaturesInsights from './FeaturesInsights';
import FeaturesProfile from './FeaturesProfile';
import FeaturesRelationships from './FeaturesRelationships';
import FeaturesLibrary from './FeaturesLibrary';
import FeaturesCalendar from './FeaturesCalendar';
import FeaturesMore from './FeaturesMore';

export default function Features() {
  return (
    <div className='flex flex-col'>
      <div className='hidden lg:flex space-x-20 max-w-content px-4'>
        <div className='flex flex-col !mt-52 lg:!mt-0'>
          <Card className='!p-0 overflow-hidden !rounded-lg'>
            <Image src='/img/insights.png' alt='Picture of mystyc Daily Insights dashboard' width={1500} height={1500} className='rounded-lg -rotate-12 scale-150 translate-x-[45%] translate-y-[20%]'/>
          </Card>
          <div className='py-20 -mr-10'>
            <FeaturesProfile />
          </div>
          <Card className='!p-0 overflow-hidden !rounded-lg'>
            <Image src='/img/relationships.png' alt='Picture of mystyc Relationships dashboard' width={1500} height={1500} />
          </Card>
          <div className='py-20 -mr-10'>
            <FeaturesCalendar />
          </div>
          <Card className='!p-6 !pb-0 overflow-hidden !rounded-lg'>
            <Image src='/img/library.png' alt='Picture of mystyc Cosmic Calendar' width={1500} height={1500} className='rounded-t-lg'/>
          </Card>
        </div>
        <div className='flex flex-col'>
          <div className='py-20 -ml-10'>
            <FeaturesInsights />
          </div>
          <Card className='!p-0 overflow-hidden !rounded-lg'>
            <Image src='/img/profile.png' alt='Picture of mystyc Star Profile dashboard' width={1500} height={1500} className='rounded-lg'/>
          </Card>
          <div className='my-20 -ml-10'>
            <FeaturesRelationships />
          </div>          
          <Card className='!p-0 overflow-hidden !rounded-lg'>
            <Image src='/img/calendar.png' alt='Picture of mystyc Astrology Star Sign page' width={1500} height={1500} className='rounded-lg rotate-6 scale-110 translate-x-[5%] translate-y-[15%]'/>
          </Card>
          <div className='mt-20 -ml-10'>
            <div className='flex-col space-y-6'>
              <FeaturesLibrary />
              <FeaturesMore />
            </div>
          </div>
        </div>
      </div>

      <div className='lg:hidden flex flex-col space-y-10'>
        <Card className='!p-0 overflow-hidden !rounded-lg !mt-52'>
          <Image src='/img/insights.png' alt='Picture of mystyc Daily Insights dashboard' width={1500} height={1500} className='rounded-lg -rotate-12 scale-150 translate-x-[45%] translate-y-[20%]'/>
        </Card>
        <FeaturesInsights />
        <Card className='!mt-20 !p-0 overflow-hidden !rounded-lg'>
          <Image src='/img/profile.png' alt='Picture of mystyc Star Profile dashboard' width={1500} height={1500} className='rounded-lg'/>
        </Card>
        <FeaturesProfile />
        <Card className='!mt-20 !p-0 overflow-hidden !rounded-lg'>
          <Image src='/img/relationships.png' alt='Picture of mystyc Relationships dashboard' width={1500} height={1500} />
        </Card>
        <FeaturesRelationships />
        <Card className='!mt-20 !p-0 overflow-hidden !rounded-lg'>
          <Image src='/img/calendar.png' alt='Picture of mystyc Astrology Star Sign page' width={1500} height={1500} className='rounded-lg rotate-6 scale-110 translate-x-[5%] translate-y-[15%]'/>
        </Card>
        <FeaturesCalendar />
        <Card className='!mt-20 !p-6 !pb-0 overflow-hidden !rounded-lg'>
          <Image src='/img/library.png' alt='Picture of mystyc Cosmic Calendar' width={1500} height={1500} className='rounded-t-lg'/>
        </Card>
        <FeaturesLibrary />
        <FeaturesMore />
      </div>
    </div>
 );
}