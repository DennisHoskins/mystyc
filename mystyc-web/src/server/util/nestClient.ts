import { Session } from '@/interfaces/session.interface';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';

export async function nestGet<T>(
  session: Session,
  endpoint: string,
  queryParams?: Record<string, any>
): Promise<T> {
  const queryString = queryParams ? buildQueryString(queryParams) : '';
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}${queryString}`;

  if (!session.authToken) {
    throw new Error(`Request failed: No Auth Token`);
  }

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

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}