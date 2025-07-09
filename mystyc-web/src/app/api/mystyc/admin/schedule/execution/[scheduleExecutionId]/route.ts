import { NextRequest } from 'next/server';
import { handleAdmin } from '../../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleExecution: string }> }
) {
  const { scheduleExecution } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'content/{scheduleExecution}' },
    { scheduleExecution }
  );
}