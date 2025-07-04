import { useRef } from 'react';

import { apiClient } from '@/api/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { useUserStore } from '@/store/userStore';
import { logger } from '@/util/logger';

export function useSessionErrorHandler() {
  const { signOut } = useAuth();
  
  // Create a stable reference to the handler
  const handlerRef = useRef<((error: any, context?: string) => Promise<boolean>) | null>(null);
  
  if (!handlerRef.current) {
    handlerRef.current = async (error: any, context = 'Unknown') => {
      logger.error(`[${context}] Session Error:`, error);
      
      if (error.message?.includes('Unauthorized') || 
          error.message?.includes('InvalidSession') || 
          error.message?.includes('session') || 
          error.message?.includes('HTTP 500')) {
        
        try {
          await apiClient.serverLogout();
          await signOut();
          useAppStore.getState().setLoggedOutByServer(true);
          useAppStore.getState().clearBusy();
          useUserStore.getState().clearUser();
        } catch (logoutErr) {
          logger.log(`[${context}] Server logout failed:`, logoutErr);
        } finally {
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }      
        }
        return true;
      }
      
      return false;
    };
  }
  
  return { handleSessionError: handlerRef.current };
}