import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { firebaseAuth } from './firebaseAuth';
import { Session, sessionManager } from './sessionManager';
import { logger } from '@/util/logger';

// Initialize Firebase Admin SDK
const firebaseAdminApp = getApps().find(app => app.name === 'firebase-admin-app') || 
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  }, 'firebase-admin-app');

const adminAuth = getAuth(firebaseAdminApp);

export interface TokenValidationResult {
  valid: boolean;
  decoded?: DecodedIdToken;
  uid?: string;
  error?: string;
}

export interface IdTokens {
  uid: string,
  authToken: string;
  refreshToken: string;
}

export interface TokenWithFallback {
  token: string;
  isRefreshed: boolean;
}

export const authTokenManager = {
  /**
   * Get fresh token for login/register (always fresh)
   */
  async getFreshTokens(email: string, password: string, isRegister = false): Promise<IdTokens> {
    try {
      logger.log('[authTokenManager] Getting fresh tokens for:', email, 'isRegister:', isRegister);
      
      const firebaseUser = isRegister 
        ? await firebaseAuth.register(email, password)
        : await firebaseAuth.signIn(email, password);
      
      const authToken = await firebaseAuth.getIdToken(firebaseUser, true);
      logger.log('[authTokenManager] Fresh tokens obtained for uid:', firebaseUser.uid);
      
      return {
        uid: firebaseUser.uid,
        authToken: authToken,
        refreshToken: firebaseUser.refreshToken
      }
    } catch (error: any) {
      logger.error('[authTokenManager] Fresh token generation failed:', error);
      
      // Map Firebase codes to your codes
      const errorMap: Record<string, { code: number; message: string }> = {
        'auth/email-already-in-use': { code: 409, message: 'Email already exists' },
        'auth/weak-password': { code: 400, message: 'Password too weak' },
        'auth/invalid-email': { code: 400, message: 'Invalid email format' },
      };

      const mapped = errorMap[error.code];
      if (mapped) {
        throw { message: mapped.message, code: mapped.code, type: 'auth_error' };
      }
      
      throw { message: 'Authentication failed', code: 500, type: 'server_error' };
    }
  },

  /**
   * Validate token and return decoded data for route protection
   * Try to refresh Token if first try fails due to expiration
   */
  async validateAndDecode(session: Session): Promise<{ decoded: DecodedIdToken; session: Session } | null> {
    try {

      console.log("");
      console.log("[AuthTokenManager] Validate and Decode:", session.authToken);
      console.log("");

      const decoded = await adminAuth.verifyIdToken(session.authToken, true);
      logger.log('[authTokenManager] Token validated successfully for uid:', decoded.uid);
      return { session, decoded };
    } catch (error: any) {
      logger.error('[authTokenManager] Error validating and decoding token:', error);
      
      // Only retry if token is expired
      if (error.code !== 'auth/id-token-expired') {
        logger.log('[authTokenManager] Token error is not expiration, not retrying');
        return null;
      }
      
      logger.log('[authTokenManager] Token expired, trying to refresh...');
      const retryResult = await this.getTokenWithFallback(session);
      if (!retryResult) {
        logger.error('[authTokenManager] Failed to get fallback token');
        return null;
      }  

      const updatedSession = {
        ...session,
        authToken: retryResult.token
      };      

      try {
        const retryDecoded = await adminAuth.verifyIdToken(retryResult.token, false);
        logger.log('[authTokenManager] Token refresh and validation successful for uid:', retryDecoded.uid);
        return { session: updatedSession, decoded: retryDecoded};
      } catch (retryError) {
        logger.error('[authTokenManager] Failed to validate refreshed token:', retryError);
        return null;
      }
    }
  },

  /**
   * Get token with fallback refresh for other requests
   * Just tries to get a fresh token from refresh token
   */
  async getTokenWithFallback(session: Session): Promise<TokenWithFallback | null> {
    logger.log('[authTokenManager] Getting fresh token from refresh token');
    if (!session) {
      logger.log('[authTokenManager] No session found');
      return null;
    }

    try {
      logger.log('[authTokenManager] Attempting token refresh');
      
      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=refresh_token&refresh_token=${session.refreshToken}`
        }
      );

      if (!response.ok) {
        logger.error('[authTokenManager] Token refresh failed with status:', response.status);
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      logger.log('[authTokenManager] Token refreshed successfully');
      
      // Update tokens in Redis
      await sessionManager.updateSession(
        session.sessionId,
        session.deviceId,
        session.uid,
        data.id_token,
        data.refresh_token
      );
      logger.log('[authTokenManager] Updated tokens in Redis');

      return {
        token: data.id_token,
        isRefreshed: true
      };
    } catch (error) {
      logger.error('[authTokenManager] Token refresh failed:', error);
      await sessionManager.clearSession();
      return null;
    }
  },

  /**
   * Create Authorization header with Bearer token
   */
  createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }
};