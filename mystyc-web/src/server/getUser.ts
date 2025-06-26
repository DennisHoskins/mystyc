import { headers } from 'next/headers';
import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { User } from '@/interfaces/user.interface';
import { logger } from '@/util/logger';

export type ServerUser = 
  | null  // logged out
  | { user: null, authenticated: true }  // logged in with a problem
  | { user: User; authenticated: true };  // logged in and working

export async function getUser(): Promise<ServerUser> {
  let sessionExists = false;

  try {
    console.log('[GET USER]');
    const headersList = await headers();
    // Get current session from Redis
    const session = await sessionManager.getCurrentSession(headersList);
    if (!session) {
      logger.log('[GET USER] No session found');
      return null;
    }

    // Mark that we found a session
    sessionExists = true;

    // Validate the token is still good
    const result = await authTokenManager.validateAndDecode(session);
    if (!result) {
      throw new Error('Invalid auth token');
    }

    const { decoded, session: currentSession } = result;    
    if (!decoded || !currentSession) {
      logger.log('[GET USER] Fresh session not found');
      return null;
    }

    // Call Nest to get fresh user data
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(currentSession.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[GET USER] Failed to fetch user from Nest:', nestResponse.status);
      return { user: null, authenticated: true };
    }

    const user: User = await nestResponse.json();
    
    // Validate user object has required fields
    if (!user || !user.firebaseUser || !user.userProfile) {
      logger.error('[GET USER] Invalid user object returned from Nest');
      return { user: null, authenticated: true };
    }
    
    return { user, authenticated: true };
  } catch (err: any) {
    // Handle specific InvalidSessionError
    if (err instanceof InvalidSessionError) {
      logger.log('[GET USER] Session exists but corrupted:', err.message);
      return { user: null, authenticated: true };
    }
    
    // If we found a session but got an error, it's corrupted
    if (sessionExists) {
      logger.log('[GET USER] Session exists but corrupted:', err.message);
      return { user: null, authenticated: true };
    }
    
    // If no session was found and we got an error, treat as no session
    logger.log('[GET USER] No session found (with error):', err.message);
    return null;
  }
}
