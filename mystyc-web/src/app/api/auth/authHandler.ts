import { NextRequest, NextResponse } from 'next/server';

import { buildDevice } from './deviceManager';
import { generateSessionId } from '../keyManager';
import { authTokenManager } from '../authTokenManager';
import { sessionManager } from '../sessionManager';
import { User } from '@/interfaces/user.interface';
import { firebaseAuth } from '../firebaseAuth';
import { logger } from '@/util/logger';

export interface AuthRequestBody {
  email: string;
  password: string;
  deviceInfo: {
    timezone: string,
    language: string
  };
  clientTimestamp: string;
}

export async function handleAuth(request: NextRequest, isRegister: boolean): Promise<NextResponse> {
  const operation = isRegister ? 'Registration' : 'Login';
  
  try {
    logger.log(``);
    logger.log(`[authHandler] ${operation} attempt started`);
    
    // Close any existing Firebase Auth sessions to ensure clean state
    await firebaseAuth.signOut();

    // Clear any existing session cookies and Redis data
    await sessionManager.clearSession();

    // Parse and validate request body
    const body: AuthRequestBody = await request.json();
    const { email, password, deviceInfo, clientTimestamp } = body;
    logger.log(`[authHandler] ${operation} for email:`, email);

    // Authenticate with Firebase and get both auth and refresh tokens
    const idTokens = await authTokenManager.getFreshTokens(email, password, isRegister);
    logger.log(`[authHandler] Firebase ${operation} successful for uid:`, idTokens.uid);

    // Build device object with deterministic ID based on request fingerprint
    const device = buildDevice(idTokens.uid, deviceInfo, request);
    logger.log(`[authHandler] Device ID generated:`, device.deviceId);

    // Generate cryptographically secure session ID from device and user
    const sessionId = generateSessionId(device.deviceId, idTokens.uid);
    logger.log(`[authHandler] Session ID generated:`, sessionId.substring(0, 8));

    // Call Nest backend to register session and get user profile
    logger.log(`[authHandler] Calling Nest API for ${operation}`);
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authTokenManager.createAuthHeader(idTokens.authToken),
      },
      body: JSON.stringify({
        firebaseUid: idTokens.uid,
        device: device,
        clientTimestamp
      })
    });

    if (!nestResponse.ok) {
      const error = await nestResponse.text();
      logger.error(`[authHandler] Nest ${operation.toLowerCase()} failed:`, error);
      
      // Log out from Firebase since operation failed
      try {
        await firebaseAuth.signOut();
      } catch (signOutError) {
        logger.error('[authHandler] Firebase signout failed:', signOutError);
      }
      
      return NextResponse.json(
        { error: `${operation} failed` },
        { status: nestResponse.status }
      );
    }    

    // Get User object from Nest
    const user: User = await nestResponse.json();
    logger.log(`[authHandler] User profile retrieved from Nest`);

    // Create session in Redis with auth and refresh tokens
    await sessionManager.createSession(
      idTokens.uid,
      device.deviceId,
      idTokens,
      sessionId
    );
    logger.log(`[authHandler] Session created in Redis`);

    // Return User object to client
    logger.log(`[authHandler] ${operation} completed successfully`);
    return NextResponse.json(user);

  } catch (error: any) {
    logger.error(`[authHandler] ${operation} error:`, error);
    
    // Clear session on any error
    try {
      await sessionManager.clearSession();
    } catch (clearError) {
      logger.error('[authHandler] Failed to clear session after error:', clearError);
    }

    // Return the error with its proper status code
    return NextResponse.json(
      { message: error.message || `${operation} failed`, type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}