'use client'

import { useAppStore } from '@/store/appStore';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Offline() {
  const setOnline = useAppStore((state) => state.setOnline);

  const handleRetry = () => {
    if (navigator.onLine) {
      setOnline(true);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md  text-center">
        <div className="text-6xl mb-6">📡</div>
        
        <Heading level={2} className="mb-4">
          Connection Lost
        </Heading>
        
        <Text variant="muted" className="mb-8">
          Please check your internet connection and try again.
        </Text>

        <div className="space-y-6">
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>

          <Text variant="small">
            We&apos;ll automatically reconnect when your connection is restored.
          </Text>
        </div>
      </div>
    </div>
  );
}