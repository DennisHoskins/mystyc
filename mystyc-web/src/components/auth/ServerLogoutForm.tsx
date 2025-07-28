'use client'

import { useState, useEffect, useRef } from 'react';

import { useAppStore } from '@/store/appStore';
import Modal from '@/components/ui/modal/Modal';
import AppLogo from '@/components/ui/AppLogo';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutForm() {
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const [shouldShow, setShouldShow] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    const wasLoggedOut = isLoggedOutByServer;
    setShouldShow(wasLoggedOut);
    hasProcessed.current = true;
    setLoggedOutByServer(false);
  }, [isLoggedOutByServer, setLoggedOutByServer]);

  const handleClick = () => {
    setShouldShow(false);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Modal isOpen={true}>
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
    </Modal>
  );
}