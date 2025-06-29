import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firebaseUid: string }> }
) {
  const { firebaseUid } = await params;  
  return handleAdmin(
    request, 
    { endpoint: 'user/{firebaseUid}' },
    { firebaseUid }
  );
}