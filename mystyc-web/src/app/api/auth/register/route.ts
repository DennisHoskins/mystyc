import { NextRequest } from 'next/server';
import { handleAuth } from '../authHandler';
export async function POST(request: NextRequest) {
  return handleAuth(request, true);
}
