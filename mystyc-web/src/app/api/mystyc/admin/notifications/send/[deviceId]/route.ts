import { NextRequest } from 'next/server';
import { handleAdmin } from '../../../adminHandler';
import { logger } from '@/util/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const body = await request.json();
  const { deviceInfo, title, notification } = body;

  logger.log('[sendNotification] deviceInfo', deviceInfo);
  
  return handleAdmin(
    request, 
    { endpoint: `notifications/send/${deviceId}`, method: 'POST' },
    undefined,
    { deviceInfo, title, body: notification }
  );
}