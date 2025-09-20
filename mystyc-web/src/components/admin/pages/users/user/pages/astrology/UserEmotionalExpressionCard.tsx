import { HandHeart } from 'lucide-react';

import { UserProfile, AstrologyCalculated } from 'mystyc-common';
import AdminCard from '@/components/admin/ui/AdminCard';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserEmotionalExpressionInteraction from './UserEmotionalExpressionInteraction';

export default function UserEmotionalExpressionCard({ 
  user,
  astrologyData 
}: { 
  user?: UserProfile | null;
  astrologyData: AstrologyCalculated;
}) {
  if (!user || !user.astrology) {
    return null;
  }

  return (
    <AdminCard
      icon={<HandHeart className='w-3 h-3' />}
      title='Emotional Expression'
      className='space-y-2'
    >
      <UserEmotionalExpressionInteraction
        interactionKey="Moon-Rising"
        sign1={user.astrology.moon.sign}
        sign2={user.astrology.rising.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Moon className='w-3 h-3' />
            <Rising className='w-3 h-3' />
            <span>Moon-Rising</span>
          </div>
        }
        description="How emotions show up socially"
      />

      <UserEmotionalExpressionInteraction
        interactionKey="Moon-Venus"
        sign1={user.astrology.moon.sign}
        sign2={user.astrology.venus.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Moon className='w-3 h-3' />
            <Venus className='w-3 h-3' />
            <span>Moon-Venus</span>
          </div>
        }
        description="Emotional needs vs relationship style"
      />

      <UserEmotionalExpressionInteraction
        interactionKey="Moon-Mars"
        sign1={user.astrology.moon.sign}
        sign2={user.astrology.mars.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Moon className='w-3 h-3' />
            <Mars className='w-3 h-3' />
            <span>Moon-Mars</span>
          </div>
        }
        description="Feelings vs action impulses"
      />
    </AdminCard>
  );
}