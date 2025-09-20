'use server'

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Session } from '@/interfaces/session.interface';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { sessionManager, InvalidSessionError } from '@/server/services/sessionManager';
import { logger } from '@/util/logger';

export async function withAdminAuth<TParams extends { deviceInfo: DeviceInfo }, TResult>(
  action: (session: Session, params: TParams) => Promise<TResult>,
  params: TParams & { deviceInfo: DeviceInfo }
): Promise<TResult> {
  const headersList = await headers();
  
  try {
    const session = await sessionManager.getCurrentSession(headersList, params.deviceInfo);
    
    if (!session) {
      logger.error('[withAdminAuth] No session found');
      redirect(`/login?error=session_expired&t=${Date.now()}`);
    }
    
    if (!session.isAdmin) {
      logger.warn('[withAdminAuth] Non-admin user attempted admin access:', session.email);
      redirect(`/dashboard?error=unauthorized&t=${Date.now()}`);
    }
    
    logger.log('[withAdminAuth] Admin access granted to:', session.email);
    
    return action(session, params);
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      logger.error('[withAdminAuth] Invalid session:', error);
      redirect(`/login?error=session_invalid&t=${Date.now()}`);
    }
    throw error;
  }
}