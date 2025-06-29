import { NextRequest } from 'next/server';
import { handleAdmin } from '../../../adminHandler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'device/{deviceId}/notifications' },
    { deviceId }
  );
}