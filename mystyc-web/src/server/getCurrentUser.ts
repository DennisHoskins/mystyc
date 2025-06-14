import { sessionManager } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { User } from '@/interfaces/user.interface';
import { forceLogout } from './forceLogout';

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get current session from Redis
    const session = await sessionManager.getCurrentSession();
    
    if (!session) {
      console.log('No session found');
      return null;
    }

    // Validate the token is still good
    const validation = await authTokenManager.validateToken(session.authToken);
    if (!validation.valid) {
      console.log('Session token invalid');
      await forceLogout('Invalid session token');
      return null;
    }

    // Call Nest to get fresh user data
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      console.error('Failed to fetch user from Nest:', nestResponse.status);
      await forceLogout(`Nest API call failed: ${nestResponse.status}`);
      return null;
    }

    const user: User = await nestResponse.json();
    
    // Validate user object has required fields
    if (!user || !user.firebaseUser || !user.userProfile) {
      console.error('Invalid user object returned from Nest');
      if (!user) console.error('Null User');
      else if (!user.firebaseUser) console.error('Null User.firebaseUser');
      else if (!user.userProfile) console.error('Null User.userProfile');
      await forceLogout('Invalid user object from Nest');
      return null;
    }
    
    return user;
    } catch (error: unknown) {
      console.error('Error fetching current user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await forceLogout(`Error in getCurrentUser: ${errorMessage}`);
      return null;
    }
}