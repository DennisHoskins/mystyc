import { UserProfile, AstrologyCalculated } from 'mystyc-common';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import Sun from '@/components/ui/icons/astrology/planets/Sun';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserZodiacPanelPlanet from './UserZodiacPanelPlanet';

interface Props {
  user: UserProfile;
  astrologyData: AstrologyCalculated;
}

export default function UserZodiacPanel({ user, astrologyData }: Props) {
  if (!user.astrology) {
    return null;
  }

  return (
    <AdminDetailGrid cols={5}>
      <UserZodiacPanelPlanet
        planet="Sun"
        planetData={astrologyData.sun}
        icon={<Sun className='w-3 h-3' />}
        label="Sun Sign"
      />
      <UserZodiacPanelPlanet
        planet="Moon"
        planetData={astrologyData.moon}
        icon={<Moon className='w-3 h-3' />}
        label="Moon Sign"
      />
      <UserZodiacPanelPlanet
        planet="Rising"
        planetData={astrologyData.rising}
        icon={<Rising className='w-3 h-3' />}
        label="Rising Sign"
      />
      <UserZodiacPanelPlanet
        planet="Mars"
        planetData={astrologyData.mars}
        icon={<Mars className='w-3 h-3' />}
        label="Mars Sign"
      />
      <UserZodiacPanelPlanet
        planet="Venus"
        planetData={astrologyData.venus}
        icon={<Venus className='w-3 h-3' />}
        label="Venus Sign"
      />
    </AdminDetailGrid>
  );
}
