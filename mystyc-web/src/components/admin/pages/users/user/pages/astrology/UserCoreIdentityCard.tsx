import { Fingerprint } from 'lucide-react';
import React from 'react';
import { UserProfile } from 'mystyc-common';
import AdminCard from '@/components/admin/ui/AdminCard';
import Sun from '@/components/ui/icons/astrology/planets/Sun';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserCoreIdentityInteraction from './UserCoreIdentityInteraction';

export default function UserCoreIdentityCard({ user }: { user?: UserProfile | null }) {
  if (!user?.astrology) return null;

  return (
    <AdminCard icon={<Fingerprint className='w-3 h-3' />} title='Core Identity Dynamics' className='space-y-2'>
      <UserCoreIdentityInteraction
        planet1="Sun"
        planet2="Moon"
        sign1={user.astrology.sunSign}
        sign2={user.astrology.moonSign}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Moon className='w-3 h-3' />
            <span>Sun-Moon</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        planet1="Sun"
        planet2="Rising"
        sign1={user.astrology.sunSign}
        sign2={user.astrology.risingSign}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Rising className='w-3 h-3' />
            <span>Sun-Rising</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        planet1="Sun"
        planet2="Mars"
        sign1={user.astrology.sunSign}
        sign2={user.astrology.marsSign}
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
            <Sun className='w-3 h-3' />
            <Mars className='w-3 h-3' />
            <span>Sun-Mars</span>
          </div>
        }
      />
      
      <UserCoreIdentityInteraction
        planet1="Sun"
        planet2="Venus"
        sign1={user.astrology.sunSign}
        sign2={user.astrology.venusSign}
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