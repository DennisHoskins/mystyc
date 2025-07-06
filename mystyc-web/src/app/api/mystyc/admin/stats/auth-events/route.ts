import { NextRequest } from 'next/server';
import { handleAdmin } from '../../adminHandler';

export async function POST(request: NextRequest) {
  return handleAdmin(request, { endpoint: 'stats/auth-events' });
}