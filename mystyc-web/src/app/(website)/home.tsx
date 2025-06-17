'use client';

import { useUser } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useTransitionRouter();
  const user = useUser();

  if (user) {
    return null;
  }

  return (
    <>
      <Heading level={1} className="mb-4">
        Welcome to mystyc
      </Heading>
      <Text className="text-gray-600 mb-8 max-w-xl">
        Discover insights about yourself, connect with your journey, and grow with our personalized tools.
      </Text>
      <div className="flex space-x-4 mb-12">
        <Button variant="primary" onClick={() => router.push('/features')}>
          Features
        </Button>
        <Button variant="secondary" onClick={() => router.push('/pricing')}>
          Pricing
        </Button>
      </div>
      <div className="w-full max-w-3xl">
        <Heading level={2} className="mb-4">
          Why mystyc?
        </Heading>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Personalized self-discovery tools</li>
          <li>Data-driven insights and analytics</li>
          <li>Community-driven support and sharing</li>
          <li>Secure and private platform</li>
        </ul>
      </div>
    </>
  );
}
