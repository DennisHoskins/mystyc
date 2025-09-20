'use server'

import { SignComplete, SignInteraction, SignInteractionComplete, ZodiacSignType } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { authTokenManager } from '@/server/services/authTokenManager';
import { redisCacheService } from '@/server/services/redisCache';
import { logger } from '@/util/logger';
import { withSession } from '../util/withSession';

export async function getSign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}): Promise<SignComplete | null> {
  return withSession(async (session) => {
    const cacheKey = `mystyc:library:sign:${params.sign}`;
    
    return redisCacheService.getOrSet(
      cacheKey,
      async () => {
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
      }
    );
  }, params.deviceInfo, 'getSign');
}

export async function getSignInteractions(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}): Promise<SignInteraction[] | null> {
  return withSession(async (session) => {
    const cacheKey = `mystyc:relationships:interactions:${params.sign}`;
    
    return redisCacheService.getOrSet(
      cacheKey,
      async () => {
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
          logger.error('[getSignInteractions] Failed to fetch sign interactions:', nestResponse.status);
          throw new Error(`Failed to fetch sign interactions: ${nestResponse.status}`);
        }

        return nestResponse.json();
      }
    );
  }, params.deviceInfo, 'getSignInteractions');
}

export async function getSignInteraction(params: {
  deviceInfo: DeviceInfo;
  sign1: ZodiacSignType,
  sign2: ZodiacSignType,
}): Promise<SignInteractionComplete | null> {
  return withSession(async (session) => {
    // Sort signs to ensure consistent cache keys (Aries-Taurus = Taurus-Aries)
    const sortedSigns = [params.sign1, params.sign2].sort();
    const cacheKey = `mystyc:relationships:interaction:${sortedSigns[0]}:${sortedSigns[1]}`;
    
    return redisCacheService.getOrSet(
      cacheKey,
      async () => {
        if (!session.authToken) {
          throw new Error(`Failed to fetch sign interaction complete: No Auth Token`);
        }

        const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/astrology/sign-interaction/${params.sign1}/${params.sign2}`, {
          method: 'GET',
          headers: {
            'Authorization': authTokenManager.createAuthHeader(session.authToken),
          },
        });

        if (!nestResponse.ok) {
          logger.error('[getSignInteraction] Failed to fetch sign interaction complete:', nestResponse.status);
          throw new Error(`Failed to fetch sign interaction complete: ${nestResponse.status}`);
        }

        return nestResponse.json();
      }
    );
  }, params.deviceInfo, 'getSignInteraction');
}