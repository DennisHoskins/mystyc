import 'server-only';

import { firebaseAuth } from './firebaseAuth';
import { logger } from '@/util/logger';

export interface IdTokens {
  uid: string,
  authToken: string;
  refreshToken: string;
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
   * Create Authorization header with Bearer token
   */
  createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }
};