import { NextRequest, NextResponse } from 'next/server';
import { firebaseAuth } from '@/app/api/firebaseAuth';
import { logger } from '@/util/logger';

interface ResetPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ResetPasswordRequestBody = await request.json();
    const { email } = body;

    // Send password reset email
    await firebaseAuth.resetPassword(email);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('Password reset error:', error);

    // Map Firebase errors like in authTokenManager
    const errorMap: Record<string, { code: number; message: string }> = {
      'auth/invalid-email': { code: 400, message: 'Invalid email format' },
      'auth/too-many-requests': { code: 429, message: 'Too many requests' }
    };
    
    const mapped = errorMap[error.code];
    if (mapped) {
      return NextResponse.json(
        { message: mapped.message, type: 'auth_error' },
        { status: mapped.code }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Password reset failed', type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}