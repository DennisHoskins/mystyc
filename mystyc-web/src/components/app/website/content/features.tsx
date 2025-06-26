'use client';

import Heading from '@/components/ui/Heading';
import Panel from '@/components/ui/Panel';

export default function Features() {
  return (
    <>
      <Heading level={1} className="text-center mb-8">
        Features
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Panel
          title="Insight Dashboard"
          description="View personalized analytics about your habits, mood, and progress over time."
        />
        <Panel
          title="Guided Journal"
          description="Write and reflect with prompts tailored to your goals and growth areas."
        />
        <Panel
          title="Community Forums"
          description="Connect with others, share experiences, and learn from a supportive community."
        />
        <Panel
          title="Secure Cloud Storage"
          description="All of your entries and data are encrypted and stored securely in the cloud."
        />
      </div>
    </>
  );
}