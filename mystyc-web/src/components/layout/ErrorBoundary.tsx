'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

import { useUserStore } from '@/store/userStore';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
    
    const appStore = useAppStore.getState();
    
    if (error.name === 'InvalidSessionError' || 
        error.message?.includes('session') || 
        error.message?.includes('token') ||
        error.message?.includes('refresh failed') ||
        error.message?.includes('invalid token')) {
      
      logger.log('Session error detected, triggering server logout flow');

      // Clear busy state and trigger server logout
      debugger
      
      const userStore = useUserStore.getState();
      userStore.clearUser();
      appStore.clearBusy();
      appStore.setLoggedOutByServer(true);
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }      
      return;
    }
    
    // For other errors, show the global error screen
    appStore.clearBusy();
    appStore.setGlobalError(true);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;