'use client'

// import { useMemo, useState, useEffect, useCallback } from 'react';
// import { useMemo, useState } from 'react';

// import { UserProfile, AstrologyCalculated } from 'mystyc-common';
// import { getUser } from '@/server/actions/admin/users';
// import { getDeviceInfo } from '@/util/getDeviceInfo';
// import { logger } from '@/util/logger';
// import { useBusy } from '@/components/ui/context/AppContext';
// import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
// import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
// import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
// import UserZodiacPanel from './UserZodiacPanel';
// import UserCoreIdentityCard from './UserCoreIdentityCard';
// import UserEmotionalExpressionCard from './UserEmotionalExpressionCard';
// import UserSocialRelationshipsCard from './UserSocialRelationshipCard';

export default function UserAstrologyPage({ firebaseUid } : { firebaseUid: string}) {

  console.log(firebaseUid);

  return (
    <>FUCK YOU</>
  );

  // const { setBusy } = useBusy();
  // const [user, setUser] = useState<UserProfile | null>(null);
  // const [astrologyData, setAstrologyData] = useState<AstrologyCalculated | null>(null);
  // const [loaded, setLoaded] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const breadcrumbs = useMemo(() => [
  //   { label: 'Admin', href: '/admin' },
  //   { label: 'Users', href: '/admin/users' },
  //   { label: user ? `${(user.firstName && user.lastName) ? user.firstName + " " + user.lastName : user.email}` : ``, href: '/admin/users/' + firebaseUid},
  //   { label: "Astrology"},
  // ], [user, firebaseUid]);

  // const loadUserAstrologyData = useCallback(async (firebaseUid: string) => {
  //   try {
  //     setError(null);
  //     setBusy(1000);
      
  //     const [userResult, astrologyResult] = await Promise.all([
  //       getUser({deviceInfo: getDeviceInfo(), firebaseUid}),
  //       getUserAstrologyData({deviceInfo: getDeviceInfo(), firebaseUid})
  //     ]);

  //     setUser(userResult);
      
  //     if (astrologyResult.error) {
  //       setError(astrologyResult.error);
  //       setAstrologyData(null);
  //     } else {
  //       setAstrologyData(astrologyResult.astrologyData);
  //     }
  //   } catch (err) {
  //     logger.error('Failed to load user astrology data:', err);
  //     setError('Failed to load user astrology data. Please try again.');
  //   } finally {
  //     setBusy(false);
  //     setLoaded(true);
  //   }
  // }, [setBusy]);

  // useEffect(() => {
  //   if (!firebaseUid) {
  //     return;
  //   }
  //   loadUserAstrologyData(firebaseUid);
  // }, [loadUserAstrologyData, firebaseUid]);

  // if (!loaded) {
  //   return null;
  // }

  // if (!user || !astrologyData) {
  //   return (
  //     <AdminItemLayout
  //       error={error ? error : 'No astrology data available.'}
  //       breadcrumbs={breadcrumbs}
  //       icon={<AstrologyIcon />}
  //       title={user && (user.firstName && user.lastName) ? user.firstName + " " + user.lastName + " Astrology" : `Astrology`}
  //     />
  //   );
  // }

  // return (
  //   <AdminItemLayout
  //     breadcrumbs={breadcrumbs}
  //     icon={getZodiacIcon(user.astrology!.sun.sign)}
  //     title={user && (user.firstName && user.lastName) ? user.firstName + " " + user.lastName + " Astrology" : `Astrology`}
  //     headerContent={<UserZodiacPanel user={user} astrologyData={astrologyData} />}
  //     itemsContent={[
  //       <div key='dynamics' className='w-full grid grid-cols-3 gap-1'>
  //         <UserCoreIdentityCard user={user} astrologyData={astrologyData} />
  //         {/* <UserSocialRelationshipsCard user={user} astrologyData={astrologyData} /> */}
  //         <UserEmotionalExpressionCard user={user} astrologyData={astrologyData} />
  //       </div>
  //     ]}
  //   />
  // );
}