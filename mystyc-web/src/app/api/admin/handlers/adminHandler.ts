import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
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
  // Destructure overrideMethod instead of defaulting to GET
  const { endpoint, method: overrideMethod, requiresNestCall = true, params } = options;

  // Build the final endpoint with routeParams + params
  const allParams = { ...routeParams, ...params };
  let finalEndpoint = endpoint;
  if (allParams) {
    Object.entries(allParams).forEach(([key, value]) => {
      finalEndpoint = finalEndpoint.replace(`{${key}}`, value);
    });
  }

  try {
    logger.log('');
    logger.log(`[admin/${finalEndpoint}] request started`);

    // Parse incoming payload (either passed in or from request.json())
    const incoming = requestBody !== undefined
      ? requestBody
      : await request.json();

    // strip out your internal fields
    const { deviceInfo, ...forwardBody } = incoming;

    // Compute the actual HTTP verb:
    //    • use overrideMethod if provided
    //    • else POST if there’s any forwardBody
    //    • else GET
    const effectiveMethod = overrideMethod
      ?? (Object.keys(forwardBody).length ? 'POST' : 'GET');

    // Session validation (unchanged)
    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.error(`[admin/${finalEndpoint}] No session found`);
      throw new InvalidSessionError(`[admin/${finalEndpoint}] No session found`);
    }
    if (!session.isAdmin) {
      logger.warn(`[admin/${finalEndpoint}] Non-admin user attempted access:`, session.email);
      throw new InvalidSessionError(`[admin/${finalEndpoint}] No session found`);
    }
    logger.log(`[admin/${finalEndpoint}] Admin access granted to:`, session.email);

    // “Redis only” shortcut (unchanged)
    if (!requiresNestCall) {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const data = await sessionManager.getSessions(limit, offset);
      logger.log(`[admin/${finalEndpoint}] Data fetched successfully, count:`, data.data?.length || 0);
      return NextResponse.json(data);
    }

    // Forward to Nest with the computed verb
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    logger.log(`[admin/${finalEndpoint}] Query params:`, queryString);

    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${finalEndpoint}${queryString ? `?${queryString}` : ''}`,
      {
        method: effectiveMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        },
        ...(effectiveMethod !== 'GET' && {
          body: JSON.stringify(forwardBody),
        }),
      }
    );

    if (!nestResponse.ok) {
      const errorText = await nestResponse.text();
      logger.error(`[admin/${finalEndpoint}] Nest request failed:`, errorText);
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
    throw error;
  }
}
