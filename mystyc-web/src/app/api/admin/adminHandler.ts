import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sessionManager } from '../sessionManager';
import { authTokenManager } from '../authTokenManager';
import { logger } from '@/util/logger';

interface AdminHandlerOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresNestCall?: boolean;
  params?: Record<string, string>;  
}

export async function handleAdmin(
  request: NextRequest, 
  options: AdminHandlerOptions,
  routeParams?: Record<string, string>,
  requestBody?: any
): Promise<NextResponse> {
  const { endpoint, method = 'GET', requiresNestCall = true, params } = options;

  const allParams = { ...routeParams, ...params };  
  let finalEndpoint = endpoint;
  if (allParams) {
    Object.entries(allParams).forEach(([key, value]) => {
      finalEndpoint = finalEndpoint.replace(`{${key}}`, value);
    });
  }

  try {
    logger.log('');
    logger.log(`[admin/${finalEndpoint}] ${method} request started`);

    const body = requestBody || await request.json();
    const { deviceInfo } = body;    

    // Get current session
    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    
    if (!session) {
      logger.error(`[admin/${finalEndpoint}] No session found`);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!session.isAdmin) {
      logger.warn(`[admin/${finalEndpoint}] Non-admin user attempted access:`, session.email);
      return NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    logger.log(`[admin/${finalEndpoint}] Admin access granted to:`, session.email);

    // Handle sessions finalEndpoint (no Nest call needed)
    if (!requiresNestCall) {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const data = await sessionManager.getSessions(limit, offset);
      logger.log(`[admin/${finalEndpoint}] Data fetched successfully, count:`, data.data?.length || 0);
      return NextResponse.json(data);
    }

    // Handle endpoints that need Nest API calls
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    logger.log(`[admin/${finalEndpoint}] Query params:`, queryString);

    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${finalEndpoint}${queryString ? `?${queryString}` : ''}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        },
        ...(method !== 'GET' && requestBody && {
          body: JSON.stringify(requestBody)
        })
      }
    );

    if (!nestResponse.ok) {
      const error = await nestResponse.text();
      logger.error(`[admin/${finalEndpoint}] Nest request failed:`, error);
      
      return NextResponse.json(
        { message: `Failed to fetch ${finalEndpoint}` },
        { status: nestResponse.status }
      );
    }

    const data = await nestResponse.json();
    logger.log(`[admin/${finalEndpoint}] Data fetched successfully, count:`, data.data?.length || 0);
    
    return NextResponse.json(data);

  } catch (error) {
    logger.error(`[admin/${finalEndpoint}] Error:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}