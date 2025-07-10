import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleExecutionId: string }> }
) {
  const { scheduleExecutionId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'schedule-executions/{scheduleExecutionId}' },
    { scheduleExecutionId }
  );
}