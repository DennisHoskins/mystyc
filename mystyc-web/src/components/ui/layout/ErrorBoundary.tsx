'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

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
    appStore.clearBusy();
    appStore.setGlobalError(true);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;