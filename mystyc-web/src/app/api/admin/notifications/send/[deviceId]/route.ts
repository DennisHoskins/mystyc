import { NextRequest } from 'next/server';
import { handleAdmin } from '../../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const body = await request.json();
  const { title, body: messageBody } = body;
  
  return handleAdmin(
    request, 
    { endpoint: `notifications/send/${deviceId}`, method: 'POST' },
    undefined,
    { title, body: messageBody }
  );
}