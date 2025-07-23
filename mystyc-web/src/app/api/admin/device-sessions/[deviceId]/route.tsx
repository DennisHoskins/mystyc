import { NextRequest } from 'next/server';

import { DeviceSession } from '@/interfaces/device-session.interface';

import { handleAdmin } from '@/app/api/admin/handlers/adminHandler';
import { sessionManager } from '@/app/api/sessionManager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const body = await request.json();

  const response = await handleAdmin(
    request, 
    { endpoint: 'devices/{deviceId}', method: "GET" },
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