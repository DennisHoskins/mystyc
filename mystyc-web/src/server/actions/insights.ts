'use server'

import { Horoscope } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';
import { withSession } from '../util/withSession';

export async function getInsights(params: {
  deviceInfo: DeviceInfo;
  date: Date;
}): Promise<Horoscope | null> {
  return withSession(async (session) => {
    if (!session.authToken) {
      throw new Error(`Failed to fetch insights: No Auth Token`);
    }

    // Format date as YYYY-MM-DD
    const dateString = params.date.toISOString().split('T')[0];
    
    // Build query string with timezone
    const queryParams = new URLSearchParams({
      timezone: params.deviceInfo.timezone
    });
    
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/horoscopes/${dateString}?${queryParams}`;
    
    const nestResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getInsights] Failed to fetch insights:', nestResponse.status);
      throw new Error(`Failed to fetch insights: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, params.deviceInfo, 'getInsights');
}