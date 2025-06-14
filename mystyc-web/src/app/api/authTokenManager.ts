import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { firebaseAuth } from './firebaseAuth';
import { sessionManager } from './sessionManager';
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
   * Validate token using Firebase Admin SDK
   * This is server-side validation without hitting Firebase servers
   */
  async validateToken(idToken: string, checkRevoked = false): Promise<TokenValidationResult> {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken, checkRevoked);
      
      logger.log('[authTokenManager] Token validated successfully for uid:', decoded.uid);
      return {
        valid: true,
        decoded,
        uid: decoded.uid
      };
    } catch (error: any) {
      logger.error('[authTokenManager] Token validation failed:', error.code || error.message);

      // clear session if token auth fails
      sessionManager.clearSession();
      
      return {
        valid: false,
        error: error.code || 'invalid-token'
      };
    }
  },

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
   * Get token with fallback refresh for other requests
   * Returns current token or refreshed token if expired
   */
  async getTokenWithFallback(): Promise<TokenWithFallback | null> {
    logger.log('[authTokenManager] Getting token with fallback refresh');
    
    const session = await sessionManager.getCurrentSession();
    
    if (!session) {
      logger.log('[authTokenManager] No session found');
      return null;
    }

    // First validate current token
    const validation = await this.validateToken(session.authToken);
    
    if (validation.valid) {
      logger.log('[authTokenManager] Current token is valid');
      return {
        token: session.authToken,
        isRefreshed: false
      };
    }

    // Token is expired/invalid, try to refresh
    if (validation.error === 'auth/id-token-expired') {
      try {
        logger.log('[authTokenManager] Token expired, attempting refresh');
        
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
    }

    // Token is invalid for other reasons
    logger.error('[authTokenManager] Token invalid for reason:', validation.error);
    await sessionManager.clearSession();
    return null;
  },

  /**
   * Extract Bearer token from Authorization header
   */
  extractBearerToken(authHeader?: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7);
  },

  /**
   * Create Authorization header with Bearer token
   */
  createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  },

  /**
   * Validate token and return decoded data for route protection
   */
  async validateAndDecode(idToken: string): Promise<DecodedIdToken | null> {
    const result = await this.validateToken(idToken);
    return result.valid ? result.decoded! : null;
  }
};