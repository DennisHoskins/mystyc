import { UserProfile } from 'mystyc-common';
import { UserAstrologyData } from 'mystyc-common/interfaces/user-astrology-data.interface';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import Sun from '@/components/ui/icons/astrology/planets/Sun';
import Moon from '@/components/ui/icons/astrology/planets/Moon';
import Rising from '@/components/ui/icons/astrology/planets/Rising';
import Mars from '@/components/ui/icons/astrology/planets/Mars';
import Venus from '@/components/ui/icons/astrology/planets/Venus';
import UserZodiacPanelPlanet from './UserZodiacPanelPlanet';

interface Props {
  user: UserProfile;
  astrologyData: UserAstrologyData;
}

export default function UserZodiacPanel({ user, astrologyData }: Props) {
  if (!user.astrology) {
    return null;
  }

  return (
    <AdminDetailGrid cols={5}>
      <UserZodiacPanelPlanet
        planet="Sun"
        planetData={astrologyData.planetaryData.Sun}
        icon={<Sun className='w-3 h-3' />}
        label="Sun Sign"
      />
      <UserZodiacPanelPlanet
        planet="Moon"
        planetData={astrologyData.planetaryData.Moon}
        icon={<Moon className='w-3 h-3' />}
        label="Moon Sign"
      />
      <UserZodiacPanelPlanet
        planet="Rising"
        planetData={astrologyData.planetaryData.Rising}
        icon={<Rising className='w-3 h-3' />}
        label="Rising Sign"
      />
      <UserZodiacPanelPlanet
        planet="Mars"
        planetData={astrologyData.planetaryData.Mars}
        icon={<Mars className='w-3 h-3' />}
        label="Mars Sign"
      />
      <UserZodiacPanelPlanet
        planet="Venus"
        planetData={astrologyData.planetaryData.Venus}
        icon={<Venus className='w-3 h-3' />}
        label="Venus Sign"
      />
    </AdminDetailGrid>
  );
}
