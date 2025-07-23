import { Injectable, UnauthorizedException } from '@nestjs/common';

import { FirebaseUser, validateFirebaseUserSafe, DecodedIdToken } from 'mystyc-common/schemas/';

import { logger } from '@/common/util/logger';
import { firebaseAdmin } from './firebase-admin.provider';

interface FirebaseAuthError extends Error {
  code: string;
}

function isFirebaseAuthError(err: unknown): err is FirebaseAuthError {
  return (
    err instanceof Error &&
    Object.prototype.hasOwnProperty.call(err, 'code') &&
    typeof (err as any).code === 'string'
  );
}

@Injectable()
export class FirebaseService {
  constructor() {}

  // Authentication and Token Verification Methods

  async verifyIdToken(
    idToken: string,
    requestContext?: {
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
    }
  ): Promise<DecodedIdToken> {
    logger.debug('Starting token verification', {
      tokenLength: idToken?.length || 0,
      ...requestContext
    }, 'FirebaseService');

    try {
      const result = await firebaseAdmin.auth().verifyIdToken(idToken, true);

      logger.debug('Token verified successfully via Firebase Admin', {
        uid: result.uid,
        exp: result.exp,
        iat: result.iat,
        issuer: result.iss,
        audience: result.aud,
        authTime: result.auth_time,
        signInProvider: result.firebase?.sign_in_provider,
        ...requestContext
      }, 'FirebaseService');

      // Log successful verification for security monitoring
      logger.info('Token verification successful', {
        uid: result.uid,
        signInProvider: result.firebase?.sign_in_provider,
        tokenAge: Date.now() / 1000 - result.iat,
        ...requestContext
      }, 'FirebaseService');

      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const code = isFirebaseAuthError(err) ? err.code : undefined;

      const securityContext = {
        error: err,
        errorCode: code,
        tokenLength: idToken?.length || 0,
        tokenPrefix: idToken?.substring(0, 20) + '...',
        timestamp: new Date().toISOString(),
        ...requestContext
      };

      let errorCategory = 'unknown';
      let securitySeverity = 'medium';
      
      if (code === 'auth/id-token-expired') {
        errorCategory = 'expired_token';
        securitySeverity = 'low'; // Normal expiration
      } else if (code === 'auth/invalid-id-token') {
        errorCategory = 'invalid_token';
        securitySeverity = 'high'; // Potential attack
      } else if (code === 'auth/id-token-revoked') {
        errorCategory = 'revoked_token';
        securitySeverity = 'high'; // Compromised token
      } else if (code === 'auth/user-disabled') {
        errorCategory = 'disabled_user';
        securitySeverity = 'medium';
      } else if (code === 'auth/user-not-found') {
        errorCategory = 'user_not_found';
        securitySeverity = 'medium';
      } else if (code === 'auth/argument-error') {
        errorCategory = 'malformed_token';
        securitySeverity = 'high'; // Potential attack
      }

      const enhancedContext = {
        ...securityContext,
        errorCategory,
        securitySeverity
      };

      if (securitySeverity === 'high') {
        logger.security('High-risk token verification failure', enhancedContext);
      } else if (securitySeverity === 'medium') {
        logger.warn('Token verification failed', enhancedContext, 'FirebaseService');
      } else {
        logger.debug('Token verification failed - low severity', enhancedContext, 'FirebaseService');
      }

      if (errorCategory === 'invalid_token' || errorCategory === 'malformed_token') {
        logger.security('Potential token attack detected', {
          attackType: 'token_manipulation',
          ...enhancedContext
        });
      }

      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async getUserById(uid: string): Promise<FirebaseUser> {
    logger.debug('Getting Firebase user by UID', { uid }, 'FirebaseService');
    
    try {
      const userRecord = await firebaseAdmin.auth().getUser(uid);
      
      logger.debug('Firebase user retrieved', { 
        uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        creationTime: userRecord.metadata.creationTime
      }, 'FirebaseService');
      
      const firebaseUserData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
      };

      const validation = validateFirebaseUserSafe(firebaseUserData);
      if (!validation.success) {
        throw validation.error;
      }

      return validation.data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const code = isFirebaseAuthError(err) ? err.code : undefined;

      logger.error('Failed to get Firebase user', { 
        uid, 
        error: err,
        errorCode: code
      }, 'FirebaseService');
      
      if (code === 'auth/user-not-found') {
        logger.security('User lookup failed - user not found', {
          uid,
          error: err,
          potentialIssue: 'token_user_mismatch'
        });
      }
      
      throw new UnauthorizedException('User not found');
    }
  }

  async revokeRefreshTokens(firebaseUid: string): Promise<void> {
    logger.info('Revoking all refresh tokens for user', { firebaseUid }, 'FirebaseService');
    
    try {
      await firebaseAdmin.auth().revokeRefreshTokens(firebaseUid);
      
      logger.security('User refresh tokens revoked successfully', {
        firebaseUid,
        revokedAt: new Date().toISOString(),
        action: 'admin_token_revocation'
      });
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const code = isFirebaseAuthError(err) ? err.code : undefined;

      logger.error('Failed to revoke refresh tokens', {
        firebaseUid,
        error: err,
        errorCode: code
      }, 'FirebaseService');
      
      throw err;
    }
  }
}
