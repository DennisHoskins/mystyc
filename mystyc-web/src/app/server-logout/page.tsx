'use client';

import { useCustomRouter } from '@/hooks/useCustomRouter';

import PageContainerAuth from '@/components/layout/PageContainerAuth';
import FormLayout from '@/components/layout/FormLayout';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutPage() {
  const router = useCustomRouter();

  const handleLoginClick = () => {
    router.replace('/login');
  };

  return (
    <PageContainerAuth>
      <FormLayout>
        <div className="text-center space-y-8">
          
          <div className="space-y-4">
            <Heading level={1}>
              You have been logged out
            </Heading>
            <Text>
              Your session was ended by an administrator. This may have been done to resolve account issues or for security reasons.
            </Text>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleLoginClick}
              className="w-full"
            >
              Sign In Again
            </Button>
            
            <div className="text-center">
              <Text variant="small">
                If you believe this was done in error, please{' '}
                <a href="mailto:support@mystyc.app" className="text-indigo-600 hover:underline">
                  contact support
                </a>
              </Text>
            </div>
          </div>
        </div>
      </FormLayout>
    </PageContainerAuth>
  );
}