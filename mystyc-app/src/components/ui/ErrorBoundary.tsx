'use client';

import { Component, ReactNode } from 'react';
import { useBusy } from '@/components/context/BusyContext';
import { errorHandler } from '@/util/errorHandler';

import Button from './Button';
import Heading from './Heading';
import Text from './Text';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onError?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorHandler.processError(error, {
      component: 'ErrorBoundary',
      action: 'component-crash',
      additional: { 
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    if (this.props.onError) {
      this.props.onError();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Something went wrong',
        fallbackMessage = 'An unexpected error occurred. Please try again.',
        showRetry = true,
        className = '',
      } = this.props;

      return (
        <div className={`text-center p-6 ${className}`}>
          <Heading level={2} className="mb-2">
            {fallbackTitle}
          </Heading>
          <Text className="mb-4">
            {fallbackMessage}
          </Text>
          
          {showRetry && (
            <Button onClick={this.handleRetry}>
              Try Again
            </Button>
          )}

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left text-sm text-gray-500">
              <summary className="cursor-pointer">Error Details (dev only)</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper that uses hooks to clear busy state
export default function ErrorBoundary(props: Omit<ErrorBoundaryProps, 'onError'>) {
  const { setBusy } = useBusy();

  const handleError = () => {
    setBusy(false);
  };

  return <ErrorBoundaryClass {...props} onError={handleError} />;
}