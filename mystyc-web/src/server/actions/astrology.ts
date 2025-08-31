'use server'

import { SignComplete, SignInteraction, ZodiacSignType } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';
import { withSession } from '../util/withSession';

export async function getSign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}): Promise<SignComplete | null> {
  return withSession(async (session) => {
    if (!session.authToken) {
      throw new Error(`Failed to fetch sign: No Auth Token`);
    }

    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/astrology/sign/${params.sign}`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getSign] Failed to fetch sign:', nestResponse.status);
      throw new Error(`Failed to fetch sign: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, params.deviceInfo, 'getSign');
}

export async function getSignInteractions(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}): Promise<SignInteraction[] | null> {
  return withSession(async (session) => {
    if (!session.authToken) {
      throw new Error(`Failed to fetch sign interactions: No Auth Token`);
    }

    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/astrology/sign-interactions/${params.sign}`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getSign] Failed to fetch sign interactions:', nestResponse.status);
      throw new Error(`Failed to fetch sign interactions: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, params.deviceInfo, 'getSign');
}