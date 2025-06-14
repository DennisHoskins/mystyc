import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/app/api/sessionManager';
import { firebaseAuth } from '@/app/api/firebaseAuth';

export async function POST(request: NextRequest) {
  try {
    // Log the logout attempt
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const source = request.headers.get('x-source') || 'unknown';
    console.log('Logout initiated', { source, userAgent });

    // Clear session from Redis and cookies
    await sessionManager.clearSession();
    
    // Sign out from Firebase
    await firebaseAuth.signOut();

    console.log('Logout completed successfully');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Even if logout fails, clear session anyway
    try {
      await sessionManager.clearSession();
    } catch (clearError) {
      console.error('Failed to clear session during logout error:', clearError);
    }

    return NextResponse.json(
      { message: error.message || 'Logout failed', type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}