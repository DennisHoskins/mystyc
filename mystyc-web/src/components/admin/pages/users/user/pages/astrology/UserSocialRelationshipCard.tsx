// import { Drama } from 'lucide-react';

// import { UserProfile, AstrologyCalculated } from 'mystyc-common';
import { UserProfile } from 'mystyc-common';
// import AdminCard from '@/components/admin/ui/AdminCard';
// import Rising from '@/components/ui/icons/astrology/planets/Rising';
// import Mars from '@/components/ui/icons/astrology/planets/Mars';
// import Venus from '@/components/ui/icons/astrology/planets/Venus';
// import UserSocialRelationshipInteraction from './UserSocialRelationshipInteraction';

export default function UserSocialRelationshipsCard({ 
  user,
  // astrologyData 
}: { 
  user?: UserProfile | null;
  // astrologyData: AstrologyCalculated;
}) {
  if (!user || !user.astrology) {
    return null;
  }

  return(
    <>TODO</>
  );

  // return (
  //   <AdminCard
  //     icon={<Drama className='w-3 h-3' />}
  //     title='Social &amp; Relationship Dynamics'
  //     className='space-y-2'
  //   >
  //     <UserSocialRelationshipInteraction
  //       interactionKey="Rising-Venus"
  //       sign1={user.astrology.risingSign}
  //       sign2={user.astrology.venusSign}
  //       astrologyData={astrologyData}
  //       label={
  //         <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
  //           <Rising className='w-3 h-3' />
  //           <Venus className='w-3 h-3' />
  //           <span>Rising-Venus</span>
  //         </div>
  //       }
  //       description="Public image vs attraction style"
  //     />

  //     <UserSocialRelationshipInteraction
  //       interactionKey="Rising-Mars"
  //       sign1={user.astrology.risingSign}
  //       sign2={user.astrology.marsSign}
  //       astrologyData={astrologyData}
  //       label={
  //         <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
  //           <Rising className='w-3 h-3' />
  //           <Mars className='w-3 h-3' />
  //           <span>Rising-Mars</span>
  //         </div>
  //       }
  //       description="Social presentation vs assertiveness"
  //     />

  //     <UserSocialRelationshipInteraction
  //       interactionKey="Venus-Mars"
  //       sign1={user.astrology.venusSign}
  //       sign2={user.astrology.marsSign}
  //       astrologyData={astrologyData}
  //       label={
  //         <div className='text-[11px] text-gray-500 flex flex-1 items-center space-x-1'>
  //           <Venus className='w-3 h-3' />
  //           <Mars className='w-3 h-3' />
  //           <span>Venus-Mars</span>
  //         </div>
  //       }
  //       description="Attraction vs pursuit/desire"
  //     />
  //   </AdminCard>
  // );
}