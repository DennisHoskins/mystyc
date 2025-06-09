import { ClientRequestHandler } from './ClientRequestHandler';
import { AuthEventLoginRegister, AuthEventLogout, User, UserProfileUpdate, UpdateFcmToken } from '@/interfaces';

export const apiClient = {
  registerSession: (dto: AuthEventLoginRegister): Promise<User> =>
    ClientRequestHandler.makeRequest<User>(
      '/api/server/auth', 
      {
        method: 'POST',
        action: 'registerSession',
        data: dto
      }
    ),    

  refreshToken: (
    firebaseToken: string
  ): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/auth', 
      {
        method: 'POST',
        action: 'refreshToken',
        data: { firebaseToken }
      }
    ),
  
  logout: (
    dto: AuthEventLogout
  ): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/user', 
      {
        method: 'POST',
        action: 'logout',
        data: dto
      }
    ),

  updateFcmToken: (
    dto: UpdateFcmToken
  ): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/user', 
      {
        method: 'POST',
        action: 'updateFcmToken',
        data: dto
      }
    ),    

  getCurrentUser: (): Promise<User> =>
    ClientRequestHandler.makeRequest<User>(
      '/api/server/user', 
      {
        method: 'GET',
        action: 'getCurrentUser'
      }
    ),

  updateUserProfile: (
    dto: UserProfileUpdate
  ): Promise<User> =>
    ClientRequestHandler.makeRequest<User>(
      '/api/server/user', 
      {
        method: 'PATCH',
        action: 'updateUserProfile',
        data: dto
      }
    ),    
};