import { NextRequest, NextResponse } from 'next/server';

import { buildDevice } from './deviceManager';
import { generateSessionId } from '../keyManager';
import { authTokenManager } from '../authTokenManager';
import { sessionManager } from '../sessionManager';
import { User } from '@/interfaces/user.interface';
import { firebaseAuth } from '../firebaseAuth';

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
    // close any open Firebase sessions
    await firebaseAuth.signOut();

    // Cleanup any existing session cookies
    await sessionManager.clearSession();

    // Parse request body
    const body: AuthRequestBody = await request.json();
    const { email, password, deviceInfo, clientTimestamp } = body;

    // Create Firebase user and get token
    const idToken = await authTokenManager.getFreshToken(email, password, isRegister);

    // Validate the token
    const validation = await authTokenManager.validateToken(idToken);
    if (!validation.valid || !validation.decoded) {
      return NextResponse.json(
        { error: 'Invalid Firebase token' },
        { status: 401 }
      );
    }

    // Build device with deterministic ID from fingerprint
    const device = buildDevice(deviceInfo, request);

    // Generate session ID tied to device and user
    const sessionId = generateSessionId(device.deviceId, validation.decoded.uid);

    // Call Nest backend to register session
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authTokenManager.createAuthHeader(idToken),
      },
      body: JSON.stringify({
        firebaseUid: validation.decoded.uid,
        device: device,
        clientTimestamp
      })
    });

    if (!nestResponse.ok) {
      const error = await nestResponse.text();
      console.error(`Nest ${operation.toLowerCase()} failed:`, error);
      
      // Log out from Firebase since operation failed
      try {
        await firebaseAuth.signOut();
      } catch (signOutError) {
        console.error('Firebase signout failed:', signOutError);
      }
      
      return NextResponse.json(
        { error: `${operation} failed` },
        { status: nestResponse.status }
      );
    }    

    // Get User object from Nest
    const user: User = await nestResponse.json();

    // Create session in Redis with the generated sessionId
    await sessionManager.createSession(
      validation.decoded.uid,
      device.deviceId,
      idToken,
      sessionId
    );

    // Return User object to client
    return NextResponse.json(user);

  } catch (error: any) {
    console.error(`${operation} error:`, error);
    
    // Clear session on any error
    try {
      await sessionManager.clearSession();
    } catch (clearError) {
      console.error('Failed to clear session after error:', clearError);
    }

    // Return the error with its proper status code
    return NextResponse.json(
      { message: error.message || `${operation} failed`, type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}