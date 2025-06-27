import { NextRequest } from 'next/server';
import { handleAdmin } from '../adminHandler';

export async function GET(request: NextRequest) {
  return handleAdmin(request, { endpoint: 'auth-events' });
}