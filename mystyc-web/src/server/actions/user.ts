'use server'

import { headers } from 'next/headers';

import { User, Content, Device } from 'mystyc-common/schemas/';
import { DeviceInfo, Session } from '@/interfaces/';
import { sessionManager } from '@/server/services/sessionManager';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';

async function withSession<T>(
  action: (session: Session) => Promise<T>,
  deviceInfo: DeviceInfo,
  actionName: string
): Promise<T | null> {
  const headersList = await headers();
  
  try {
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.log(`[${actionName}] No Current Session`);
      return null;
    }
    return action(session);
  } catch (err) {
    throw err;
  }
}

export async function getUser(deviceInfo: DeviceInfo): Promise<User | null> {
  return withSession(async (session) => {
    logger.log('[getUser] Fetching user data');

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getUser] Failed to fetch user from Nest:', nestResponse.status);
      throw new Error(`Failed to fetch user: ${nestResponse.status}`);
    }

    const user: User = await nestResponse.json();
    
    if (!user || !user.firebaseUser || !user.userProfile) {
      logger.error('[getUser] Invalid user object returned from Nest');
      throw new Error('Invalid user data');
    }

    user.device = {
      firebaseUid: user.firebaseUser.uid,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
    };
    
    return user;
  }, deviceInfo, 'getUser');
}

export async function getUserContent(deviceInfo: DeviceInfo): Promise<Content | null> {
  return withSession(async (session) => {
    logger.log('[getUserContent] Fetching user content');

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/content`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceInfo })
    });

    if (!nestResponse.ok) {
      logger.error('[getUserContent] Failed to fetch content:', nestResponse.status);
      throw new Error(`Failed to fetch content: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, deviceInfo, 'getUserContent');
}

export async function getBillingPortal(deviceInfo: DeviceInfo): Promise<{ portalUrl: string } | null> {
  return withSession(async (session) => {
    logger.log('[getBillingPortal] Getting billing portal URL');

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/billing-portal`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
        'Content-Type': 'application/json',
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getBillingPortal] Failed:', nestResponse.status);
      throw new Error(`Failed to get billing portal: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, deviceInfo, 'getBillingPortal');
}

export async function startSubscription(
  deviceInfo: DeviceInfo,
  priceId: string
): Promise<{ sessionUrl: string } | null> {
  return withSession(async (session) => {
    logger.log('[startSubscription] Starting subscription for price:', priceId);

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/start-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId })
    });

    if (!nestResponse.ok) {
      logger.error('[startSubscription] Failed:', nestResponse.status);
      throw new Error(`Failed to start subscription: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, deviceInfo, 'startSubscription');
}

export async function cancelSubscription(deviceInfo: DeviceInfo): Promise<string | null> {
  return withSession(async (session) => {
    logger.log('[cancelSubscription] Cancelling subscription');

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
        'Content-Type': 'application/json',
      },
    });

    if (!nestResponse.ok) {
      logger.error('[cancelSubscription] Failed:', nestResponse.status);
      throw new Error(`Failed to cancel subscription: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, deviceInfo, 'cancelSubscription');
}

export async function updateFcmToken(
  deviceInfo: DeviceInfo,
  deviceId: string,
  fcmToken: string
): Promise<Device | null> {
  return withSession(async (session) => {
    logger.log('[updateFcmToken] Updating FCM token for device:', deviceId.substring(0, 8));

    if (!session.authToken) {
      throw new Error(`Failed to fetch user: No Auth Token`);
    }
    
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/notify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
      body: JSON.stringify({
        firebaseUid: session.uid,
        deviceId: session.deviceId,
        fcmToken
      })
    });

    if (!nestResponse.ok) {
      throw new Error(`Failed to update FCM token: ${nestResponse.status}`);
    }

    // Update in Redis too
    await sessionManager.updateSessionFcmToken(
      session.sessionId, 
      session.deviceId, 
      session.uid, 
      fcmToken
    );
    logger.log("[updateFcmToken] Updated fcmToken in Redis");

    return nestResponse.json();
  }, deviceInfo, 'updateFcmToken');
}