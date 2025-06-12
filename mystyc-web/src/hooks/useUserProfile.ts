// import { useState, useCallback } from 'react';
// import { apiClient } from '@/api/client/apiClient';
// import { useApp } from '@/components/context/AppContext';
// import { errorHandler } from '@/util/errorHandler';

// export function useUserProfile() {
//   const { app, setApp } = useApp();
//   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

//   const updateProfile = useCallback(async (
//     data: Partial<{ fullName?: string; dateOfBirth?: string; zodiacSign?: string }>
//   ): Promise<void> => {
//     if (!app) return;
//     if (isUpdatingProfile) throw new Error('Profile update already in progress');

//     setIsUpdatingProfile(true);
//     // try {
//     //   const updatedUserProfile = await apiClient.updateUserProfile(data);

//     //   const newAppState = {
//     //     deviceId: app.deviceId,
//     //     user: {
//     //       ...app.user,
//     //       userProfile: updatedUserProfile,
//     //     },
//     //     fcmToken: app.fcmToken,
//     //   };

//     //   setApp(newAppState);
//     // } catch (err) {
//     //   errorHandler.processError(err, {
//     //     component: 'useUserProfile',
//     //     action: 'updateProfile',
//     //   });
//     //   throw err;
//     // } finally {
//     //   setIsUpdatingProfile(false);
//     // }
//   }, [app, setApp, isUpdatingProfile]);

//   return {
//     updateProfile,
//     isUpdatingProfile,
//   };
// }
