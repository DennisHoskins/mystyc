import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firebaseAdmin } from './firebase-admin.provider';

import { DecodedIdToken } from '@/common/interfaces/decodedToken.interface';
import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { logger } from '@/util/logger';

@Injectable()
export class FirebaseService {

  constructor() {}

  async verifyIdToken(idToken: string, requestContext?: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  }): Promise<DecodedIdToken> {
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
    } catch (error) {
      const securityContext = {
        error: error.message,
        errorCode: error.code,
        tokenLength: idToken?.length || 0,
        tokenPrefix: idToken?.substring(0, 20) + '...',
        timestamp: new Date().toISOString(),
        ...requestContext
      };

      let errorCategory = 'unknown';
      let securitySeverity = 'medium';
      
      if (error.code === 'auth/id-token-expired') {
        errorCategory = 'expired_token';
        securitySeverity = 'low'; // Normal expiration
      } else if (error.code === 'auth/invalid-id-token') {
        errorCategory = 'invalid_token';
        securitySeverity = 'high'; // Potential attack
      } else if (error.code === 'auth/id-token-revoked') {
        errorCategory = 'revoked_token';
        securitySeverity = 'high'; // Compromised token
      } else if (error.code === 'auth/user-disabled') {
        errorCategory = 'disabled_user';
        securitySeverity = 'medium';
      } else if (error.code === 'auth/user-not-found') {
        errorCategory = 'user_not_found';
        securitySeverity = 'medium';
      } else if (error.code === 'auth/argument-error') {
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
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error) {
      logger.error('Failed to get Firebase user', { 
        uid, 
        error: error.message,
        errorCode: error.code
      }, 'FirebaseService');
      
      if (error.code === 'auth/user-not-found') {
        logger.security('User lookup failed - user not found', {
          uid,
          error: error.message,
          potentialIssue: 'token_user_mismatch'
        });
      }
      
      throw new UnauthorizedException('User not found');
    }
  }

  async sendNotification(token: string, title: string, body: string) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        token,
      };

      const response = await firebaseAdmin.messaging().send(message);
      logger.info('Notification sent successfully', { 
        messageId: response,
        token: token.substring(0, 20) + '...' 
      });
      
      return response;
    } catch (error) {
      logger.error('Failed to send notification', { 
        error: error.message,
        token: token.substring(0, 20) + '...' 
      });
      throw error;
    }
  }  
}