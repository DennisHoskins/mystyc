import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ authId: string }> }
) {
  const { authId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'auth-events/{authId}' },
    { authId }
  );
}