import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'users/{userId}' },
    { userId }
  );
}