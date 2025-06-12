'use client';

import { useApp } from '@/components/context/AppContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Pricing() {
  const router = useCustomRouter();
  const { app } = useApp();

  if (app && app.user) {
    return null;
  }

  return (
    <>
      <Heading level={1} className="text-center mb-8">
        Pricing
      </Heading>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border rounded-lg p-6 shadow-sm flex flex-col">
          <Heading level={3} className="mb-2 text-center">
            Free
          </Heading>
          <Text className="text-gray-700 mb-4 text-center">
            Basic access to journaling and community
          </Text>
          <Text className="text-3xl font-bold mb-4 text-center">$0</Text>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>Guided Journal</li>
            <li>Community Forums</li>
            <li>Limited Insights</li>
          </ul>
          <Button
            variant="secondary"
            onClick={() => router.push('/register')}
            className="mt-auto"
          >
            Get Started
          </Button>
        </div>
        <div className="border rounded-lg p-6 shadow-sm flex flex-col">
          <Heading level={3} className="mb-2 text-center">
            Pro
          </Heading>
          <Text className="text-gray-700 mb-4 text-center">
            Full analytics, advanced journal prompts
          </Text>
          <Text className="text-3xl font-bold mb-4 text-center">$9.99/mo</Text>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>All Free Features</li>
            <li>Insight Dashboard</li>
            <li>Unlimited Journaling</li>
            <li>Priority Support</li>
          </ul>
          <Button
            variant="primary"
            onClick={() => router.push('/register')}
            className="mt-auto"
          >
            Choose Pro
          </Button>
        </div>
        <div className="border rounded-lg p-6 shadow-sm flex flex-col">
          <Heading level={3} className="mb-2 text-center">
            Enterprise
          </Heading>
          <Text className="text-gray-700 mb-4 text-center">
            Custom solutions for teams and organizations
          </Text>
          <Text className="text-3xl font-bold mb-4 text-center">Contact Us</Text>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>All Pro Features</li>
            <li>Dedicated Account Manager</li>
            <li>Custom Integrations</li>
          </ul>
          <Button
            variant="secondary"
            onClick={() => router.push('/contact')}
            className="mt-auto"
          >
            Contact Sales
          </Button>
        </div>
      </div>
      <div className="mt-12 flex justify-center">
        <Button variant="secondary" onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    </>
  );
}
