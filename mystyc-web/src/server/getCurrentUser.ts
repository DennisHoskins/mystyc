import { sessionManager } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { User } from '@/interfaces/user.interface';

export async function getCurrentUser(): Promise<User | null> {
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
    throw new Error('Invalid session token');
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
    throw new Error(`Nest API call failed: ${nestResponse.status}`);
  }

  const user: User = await nestResponse.json();
  
  // Validate user object has required fields
  if (!user || !user.firebaseUser || !user.userProfile) {
    console.error('Invalid user object returned from Nest');
    throw new Error('Invalid user object from Nest');
  }
  
  return user;
}