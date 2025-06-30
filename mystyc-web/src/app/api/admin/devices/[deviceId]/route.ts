import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';
import { sessionManager } from '../../../sessionManager';
import { DeviceSession } from '@/interfaces/deviceSession.interface';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const body = await request.json();
  
  const response = await handleAdmin(
    request, 
    { endpoint: 'devices/{deviceId}' },
    { deviceId },
    body
  );

  if (!response.ok) {
    return response;
  }

  const device = await response.json();

  const sessionId = await sessionManager.getDeviceSession(deviceId);
  if (!sessionId) {
    const deviceSession: DeviceSession = {
      device: device,
      session: null
    };

    return Response.json(deviceSession);
  }

  const session = await sessionManager.getSession(sessionId);
  
  const deviceSession: DeviceSession = {
    device: device,
    session: session
  };

  return Response.json(deviceSession);
}