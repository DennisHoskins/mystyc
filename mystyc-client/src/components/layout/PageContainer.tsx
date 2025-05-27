'use client';

import ErrorBoundary from '@/components/ui/ErrorBoundary';

type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
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