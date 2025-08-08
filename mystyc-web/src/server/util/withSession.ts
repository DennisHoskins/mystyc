import { headers } from 'next/headers';
import { sessionManager } from '@/server/services/sessionManager';
import { DeviceInfo, Session } from '@/interfaces/';
import { logger } from '@/util/logger';

export async function withSession<T>(
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
