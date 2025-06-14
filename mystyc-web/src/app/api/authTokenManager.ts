import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { firebaseAuth } from './firebaseAuth';
import { sessionManager } from './sessionManager';

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
      
      return {
        valid: true,
        decoded,
        uid: decoded.uid
      };
    } catch (error: any) {
      console.error('Token validation failed:', error.code || error.message);
      
      return {
        valid: false,
        error: error.code || 'invalid-token'
      };
    }
  },

  /**
   * Get fresh token for login/register (always fresh)
   */
  async getFreshToken(email: string, password: string, isRegister = false): Promise<string> {
    try {
      const firebaseUser = isRegister 
        ? await firebaseAuth.register(email, password)
        : await firebaseAuth.signIn(email, password);
      
      return await firebaseAuth.getIdToken(firebaseUser, true); // Force refresh
    } catch (error: any) {
      console.error('Fresh token generation failed:', error);
      
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
    const session = await sessionManager.getCurrentSession();
    
    if (!session) {
      return null;
    }

    // First validate current token
    const validation = await this.validateToken(session.token);
    
    if (validation.valid) {
      return {
        token: session.token,
        isRefreshed: false
      };
    }

    // Token is expired/invalid, try to refresh
    if (validation.error === 'auth/id-token-expired') {
      try {
        // Use refresh token if available, otherwise force refresh via Firebase
        // Note: This would require storing refresh token or re-authenticating
        // For now, we'll clear the session and require re-login
        console.warn('Token expired, clearing session');
        await sessionManager.clearSession();
        return null;
      } catch (error) {
        console.error('Token refresh failed:', error);
        await sessionManager.clearSession();
        return null;
      }
    }

    // Token is invalid for other reasons
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