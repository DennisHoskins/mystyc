'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Features() {
  const router = useTransitionRouter();

  return (
    <>
      <Heading level={1} className="text-center mb-8">
        Features
      </Heading>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 shadow-sm">
          <Heading level={3} className="mb-2">
            Insight Dashboard
          </Heading>
          <Text>
            View personalized analytics about your habits, mood, and progress over time.
          </Text>
        </div>
        <div className="border rounded-lg p-6 shadow-sm">
          <Heading level={3} className="mb-2">
            Guided Journal
          </Heading>
          <Text>
            Write and reflect with prompts tailored to your goals and growth areas.
          </Text>
        </div>
        <div className="border rounded-lg p-6 shadow-sm">
          <Heading level={3} className="mb-2">
            Community Forums
          </Heading>
          <Text>
            Connect with others, share experiences, and learn from a supportive community.
          </Text>
        </div>
        <div className="border rounded-lg p-6 shadow-sm">
          <Heading level={3} className="mb-2">
            Secure Cloud Storage
          </Heading>
          <Text>
            All of your entries and data are encrypted and stored securely in the cloud.
          </Text>
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
