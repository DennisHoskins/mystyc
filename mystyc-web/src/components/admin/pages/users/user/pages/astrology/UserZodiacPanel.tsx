import React from 'react';
import { UserProfile } from 'mystyc-common';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import Sun from '@/components/ui/icons/astrology/planets/Sun';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserZodiacPanelPlanet from './UserZodiacPanelPlanet';

export default function UserZodiacPanel({ user }: { user?: UserProfile | null }) {
  if (!user || !user.astrology) {
    return null;
  }

  return (
    <AdminDetailGrid cols={5}>
      <UserZodiacPanelPlanet
        planet="Sun"
        sign={user.astrology.sunSign}
        icon={<Sun className='w-3 h-3' />}
        label="Sun Sign"
      />
      <UserZodiacPanelPlanet
        planet="Moon"
        sign={user.astrology.moonSign}
        icon={<Moon className='w-3 h-3' />}
        label="Moon Sign"
      />
      <UserZodiacPanelPlanet
        planet="Rising"
        sign={user.astrology.risingSign}
        icon={<Rising className='w-3 h-3' />}
        label="Rising Sign"
      />
      <UserZodiacPanelPlanet
        planet="Mars"
        sign={user.astrology.marsSign}
        icon={<Mars className='w-3 h-3' />}
        label="Mars Sign"
      />
      <UserZodiacPanelPlanet
        planet="Venus"
        sign={user.astrology.venusSign}
        icon={<Venus className='w-3 h-3' />}
        label="Venus Sign"
      />
    </AdminDetailGrid>
  );
}