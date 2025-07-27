import { apiClient } from '@/api/apiClient';
import { useAppStore } from '@/store/appStore';
import { useUserStore } from '@/store/userStore';
import { logger } from '@/util/logger';

export async function handleSessionError(error: any, context = 'Unknown') {
  logger.error(`[${context}] Session Error:`, error);
  
  const message = error.message ? error.message : error.error ? error.error : error;

  if (message.includes('Unauthorized') || 
      message.includes('InvalidSession') || 
      message.toLowerCase().includes('invalid session') || 
      message.includes('session') || 
      message.includes('HTTP 500')) {
    
    try {
      await apiClient.serverLogout();
      useAppStore.getState().setLoggedOutByServer(true);
      useAppStore.getState().clearBusy();
      useUserStore.getState().clearUser();
    } catch (logoutErr) {
      logger.log(`[${context}] Server logout failed:`, logoutErr);
    } finally {
      window.location.reload();
    }
    return true;
  }
  
  return false;
}