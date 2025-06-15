'use client';

import { useRouter } from 'next/navigation';

import FormLayout from '@/components/layout/FormLayout';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutPage() {
  const router = useRouter();

  const handleHomeClick = () => {
    router.replace("/");
  };

  return (
    <>
      <FormLayout
        subtitle="You have been logged out"
      >
        <Text>
          Your session was ended by an administrator. This may have been done to resolve account issues or for security reasons.
        </Text>
        <div className="space-y-4">
          <Button 
            onClick={handleHomeClick}
            className="w-full"
          >
            Home
          </Button>
        </div>
      </FormLayout>
    </>
  );
}