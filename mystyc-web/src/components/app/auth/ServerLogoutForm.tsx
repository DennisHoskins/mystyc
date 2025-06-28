'use client';

import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import AppLogo from '@/components/ui/AppLogo';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutForm() {
  const router = useRouter();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize component
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
  }, [isReady]);

  // Redirect if not in server logout state
  useEffect(() => {
    if (!isReady || isLoggedOutByServer) {
      return;
    }
    
    // router.replace('/', false);
    router.replace('/');
  }, [isReady, isLoggedOutByServer, router]);

  const handleClick = () => {
    setLoggedOutByServer(false);
  };

  if (!isReady || !isLoggedOutByServer) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md text-center px-4 border rounded-md p-6 shadow-sm bg-white">
        <AppLogo scale={1.2} subheading={"You have been logged out"} />
        <div className="mt-8 space-y-6">

          <Text>
            Your session was ended by an administrator. This may have been done to resolve
            account issues or for security reasons.
          </Text>
          
          <Button onClick={handleClick} className="w-full">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}