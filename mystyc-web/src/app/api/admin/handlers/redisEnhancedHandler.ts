import { NextRequest, NextResponse } from 'next/server';
import { handleAdmin } from './adminHandler';
import { sessionManager } from '../../sessionManager';
import { DeviceSession } from '@/interfaces/device-session.interface';
import { logger } from '@/util/logger';

export async function handleRedisEnhancedRoute(
  request: NextRequest,
  route: string,
  path: string[]
): Promise<NextResponse> {
  logger.log(`[redisEnhancedHandler] Handling route: ${route}`);

  try {
    if (route.match(/^devices\/[^\/]+\/session$/)) {
      const deviceId = path[1];
      logger.log(`[redisEnhancedHandler] Getting device session for device:`, deviceId.substring(0, 8));
      
      const body = await request.json();
      
      // First get device from Nest
      logger.log(`[redisEnhancedHandler] Fetching device data from Nest`);
      const response = await handleAdmin(
        request,
        { endpoint: `devices/{deviceId}` },
        { deviceId },
        body
      );

      if (!response.ok) {
        logger.error(`[redisEnhancedHandler] Failed to get device from Nest:`, response.status);
        return response;
      }
      
      const device = await response.json();
      logger.log(`[redisEnhancedHandler] Device data retrieved from Nest`);

      // Then get session from Redis
      logger.log(`[redisEnhancedHandler] Looking up session in Redis for device:`, deviceId.substring(0, 8));
      const sessionId = await sessionManager.getDeviceSession(deviceId);
      
      if (!sessionId) {
        logger.log(`[redisEnhancedHandler] No session found for device:`, deviceId.substring(0, 8));
        const deviceSession: DeviceSession = {
          device: device,
          session: null
        };
        return NextResponse.json(deviceSession);
      }

      logger.log(`[redisEnhancedHandler] Found session:`, sessionId.substring(0, 8));
      const session = await sessionManager.getSession(sessionId);
      
      const deviceSession: DeviceSession = {
        device: device,
        session: session
      };

      logger.log(`[redisEnhancedHandler] Device session data combined successfully`);
      return NextResponse.json(deviceSession);
    }

    logger.error(`[redisEnhancedHandler] Unknown Redis-enhanced route: ${route}`);
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });

  } catch (error) {
    logger.error(`[redisEnhancedHandler] Error handling route ${route}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}