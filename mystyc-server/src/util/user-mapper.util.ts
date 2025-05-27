import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';

/**
 * Centralized user data transformation utility
 * 
 * Handles conversion from Firebase decoded token to FirebaseUser interface
 * Eliminates manual transformation logic scattered across controllers
 */
export class UserMapperUtil {
  /**
   * Transforms Firebase decoded token to FirebaseUser interface
   * 
   * @param decodedToken - Firebase decoded token from auth decorator
   * @returns FirebaseUser interface compliant object
   */
  static transformFirebaseUser(decodedToken: any): FirebaseUser {
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.displayName || decodedToken.name,
      photoURL: decodedToken.photoURL || decodedToken.picture,
      emailVerified: decodedToken.email_verified || decodedToken.emailVerified
    };
  }
}