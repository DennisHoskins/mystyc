'use client';

import ErrorBoundary from '@/components/ui/ErrorBoundary';

type PageContainerAuthProps = {
  children: React.ReactNode;
};

export default function PageContainerAuth({ children }: PageContainerAuthProps) {
  return (
    <div className="flex flex-col min-h-full justify-center items-center px-4">
      <div className="w-full max-w-md">
        <ErrorBoundary
          fallbackTitle="Page Error"
          fallbackMessage="This page encountered an error. Please try again."
        >
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}
