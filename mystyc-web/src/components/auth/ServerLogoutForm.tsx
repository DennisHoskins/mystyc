'use client'

import Modal from '@/components/ui/modal/Modal';
import AppLogo from '@/components/ui/AppLogo';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutForm() {

  const handleClick = () => {
  };

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