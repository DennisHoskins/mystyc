import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionManager, InvalidSessionError } from '@/server/services/sessionManager';
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
    if (err instanceof InvalidSessionError) {
      logger.warn(`[${actionName}] Invalid session detected, clearing and redirecting:`, err.message);
      
      // Clear the corrupted session
      try {
        await sessionManager.clearSession();
        logger.log(`[${actionName}] Corrupted session cleared successfully`);
      } catch (clearErr) {
        logger.error(`[${actionName}] Failed to clear corrupted session:`, clearErr);
      }
      
      // Server-side redirect to server-logout page for cleanup
      redirect(`/server-logout?t=${Date.now()}`);
    }
    
    // Re-throw other errors
    throw err;
  }
}