import { Fingerprint } from 'lucide-react';

import { UserProfile, AstrologyCalculated } from 'mystyc-common';
import AdminCard from '@/components/admin/ui/AdminCard';
import Sun from '@/components/ui/icons/astrology/planets/Sun';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserCoreIdentityInteraction from './UserCoreIdentityInteraction';

export default function UserCoreIdentityCard({ 
  user,
  astrologyData 
}: { 
  user?: UserProfile | null;
  astrologyData: AstrologyCalculated;
}) {
  if (!user?.astrology) return null;

  return (
    <AdminCard icon={<Fingerprint className='w-3 h-3' />} title='Core Identity Dynamics' className='space-y-2'>
      <UserCoreIdentityInteraction
        interactionKey="Sun-Moon"
        sign1={user.astrology.sun.sign}
        sign2={user.astrology.moon.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Moon className='w-3 h-3' />
            <span>Sun-Moon</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        interactionKey="Sun-Rising"
        sign1={user.astrology.sun.sign}
        sign2={user.astrology.rising.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Rising className='w-3 h-3' />
            <span>Sun-Rising</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        interactionKey="Sun-Mars"
        sign1={user.astrology.sun.sign}
        sign2={user.astrology.mars.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Mars className='w-3 h-3' />
            <span>Sun-Mars</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        interactionKey="Sun-Venus"
        sign1={user.astrology.sun.sign}
        sign2={user.astrology.venus.sign}
        astrologyData={astrologyData}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Venus className='w-3 h-3' />
            <span>Sun-Venus</span>
          </div>
        }
      />
    </AdminCard>
  );
}