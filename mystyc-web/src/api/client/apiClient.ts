import { ClientRequestHandler } from './ClientRequestHandler';
// import { AuthEventLoginRegister, AuthEventLogout, User, UserProfileUpdate, UpdateFcmToken } from '@/interfaces';
import { AuthEventLoginRegister, AuthEventLogout, User, Device } from '@/interfaces';

import { authCache } from '@/util/authCache';

export const apiClient = {

  registerSession: (
    firebaseUid: string, 
    device: Device, 
    authToken: string
  ): Promise<User> => {
    const registerDTO: AuthEventLoginRegister = {
      firebaseUid,
      device,
      clientTimestamp: new Date().toISOString()
    };

    return ClientRequestHandler.makeRequest<User>(
      `/users/me`, 
      {
        method: 'POST',
        action: 'registerSession',
        data: registerDTO,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }        
      }
    )
  },

  // updateFcmToken: (fcmToken: string): Promise<void> => {
  //   const firebaseUid = authCache.getFirebaseUid();

  //   const updateFcmTokenDTO: UpdateFcmToken = {
  //     firebaseUid: firebaseUid,
  //     deviceId: authCache.getDeviceFingerprint(),
  //     fcmToken: fcmToken,
  //   }

  //   return ClientRequestHandler.makeRequest<void>(
  //     `${serverRoot}auth`, 
  //     {
  //       method: 'POST',
  //       action: 'refreshToken',
  //       data: updateFcmTokenDTO
  //     }
  //   )
  // },
  
  logout: (): Promise<void> => {
    const firebaseUid = authCache.getFirebaseUid();
    if (!firebaseUid) {
      throw new Error("No user logged in");
    }

    const logoutDto: AuthEventLogout = {
      firebaseUid: firebaseUid,
      deviceId: authCache.getDeviceFingerprint(),
      clientTimestamp: new Date().toISOString()
    }
   
    return ClientRequestHandler.makeRequest<void>(
      `/users/logout`, 
      {
        method: 'POST',
        action: 'logout',
        data: logoutDto
      }
    )
  },

  // getCurrentUser: (): Promise<User> =>


  //   ClientRequestHandler.makeRequest<User>(
  //     `${serverRoot}user`, 
  //     {
  //       method: 'GET',
  //       action: 'getCurrentUser'
  //     }
  //   ),

  // updateUserProfile: (): Promise<User> => {
  //   const firebaseUid = authCache.getFirebaseUid();

  //   const updateUserProfileDTO: UserProfileUpdate = {
  //     firebaseUid: firebaseUid,
  //     deviceId: authCache.getDeviceFingerprint(),
  // }

  //   return ClientRequestHandler.makeRequest<User>(
  //     `${serverRoot}auth`, 
  //     {
  //       method: 'PATCH',
  //       action: 'updateUserProfile',
  //       data: updateUserProfileDTO
  //     }
  //   )
  // }
};