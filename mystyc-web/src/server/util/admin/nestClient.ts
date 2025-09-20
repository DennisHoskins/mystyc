'use server'

import { Session } from '@/interfaces/session.interface';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function nestGet<T>(
  session: Session,
  endpoint: string,
  queryParams?: Record<string, any>
): Promise<T> {
  const queryString = queryParams ? buildQueryString(queryParams) : '';
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}${queryString}`;

  if (!session.authToken) {
    logger.error(`[nestClient] Request failed: No Auth Token`);
    throw new Error(`Request failed: No Auth Token`);
  }

  logger.log(`[nestClient] GET ${endpoint}${queryString}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authTokenManager.createAuthHeader(session.authToken),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error(`[nestClient] Request failed: ${response.status}`, error);
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function nestPost<T>(
  session: Session,
  endpoint: string,
  body?: any,
  queryParams?: Record<string, any>
): Promise<T> {
  const queryString = queryParams ? buildQueryString(queryParams) : '';
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}${queryString}`;

  if (!session.authToken) {
    logger.error(`[nestClient] Request failed: No Auth Token`);
    throw new Error(`Request failed: No Auth Token`);
  }

  logger.log(`[nestClient] POST ${endpoint}${queryString}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authTokenManager.createAuthHeader(session.authToken),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error(`[nestClient] Request failed: ${response.status}`, error);
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
