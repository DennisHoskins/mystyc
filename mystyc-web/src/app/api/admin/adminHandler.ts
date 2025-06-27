import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sessionManager } from '../sessionManager';
import { authTokenManager } from '../authTokenManager';
import { logger } from '@/util/logger';

interface AdminHandlerOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresNestCall?: boolean;
}

export async function handleAdmin(
  request: NextRequest, 
  options: AdminHandlerOptions
): Promise<NextResponse> {
  const { endpoint, method = 'GET', requiresNestCall = true } = options;
  
  try {
    logger.log('');
    logger.log(`[admin/${endpoint}] ${method} request started`);

    // Get current session
    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList);
    
    if (!session) {
      logger.error(`[admin/${endpoint}] No session found`);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle sessions endpoint (no Nest call needed)
    if (!requiresNestCall) {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const data = await sessionManager.getSessions(limit, offset);
      logger.log(`[admin/${endpoint}] Data fetched successfully, count:`, data.data?.length || 0);
      return NextResponse.json(data);
    }

    // Handle endpoints that need Nest API calls
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    logger.log(`[admin/${endpoint}] Query params:`, queryString);

    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${endpoint}${queryString ? `?${queryString}` : ''}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        }
      }
    );

    if (!nestResponse.ok) {
      const error = await nestResponse.text();
      logger.error(`[admin/${endpoint}] Nest request failed:`, error);
      
      return NextResponse.json(
        { message: `Failed to fetch ${endpoint}` },
        { status: nestResponse.status }
      );
    }

    const data = await nestResponse.json();
    logger.log(`[admin/${endpoint}] Data fetched successfully, count:`, data.data?.length || 0);
    
    return NextResponse.json(data);

  } catch (error) {
    logger.error(`[admin/${endpoint}] Error:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}