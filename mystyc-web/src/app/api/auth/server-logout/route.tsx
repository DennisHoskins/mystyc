import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/app/api/sessionManager';
import { firebaseAuth } from '@/app/api/firebaseAuth';

async function doLogout(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const source    = request.headers.get('x-source')  || 'unknown';
  console.log('Logout initiated', { source, userAgent });

  await sessionManager.clearSession();   // Redis + cookies
  await firebaseAuth.signOut();          // Firebase

  console.log('Logout completed successfully');
}

export async function POST(request: NextRequest) {
  try {
    await doLogout(request);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: error.message ?? 'Logout failed', type: error.type ?? 'server_error' },
      { status: error.code ?? 500 }
    );
  }
}