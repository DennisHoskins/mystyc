import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'daily-content/{contentId}' },
    { contentId }
  );
}