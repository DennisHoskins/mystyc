import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  const { scheduleId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'schedules/{scheduleId}' },
    { scheduleId }
  );
}