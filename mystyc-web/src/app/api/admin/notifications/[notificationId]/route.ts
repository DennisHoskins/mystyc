import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'notifications/{notificationId}' },
    { notificationId }
  );
}