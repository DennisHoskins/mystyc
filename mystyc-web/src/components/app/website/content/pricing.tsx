'use client';

import Heading from '@/components/ui/Heading';
import PricingCard from '@/components/app/website/ui/PricingCard';

export default function Pricing() {
  return (
    <>
      <Heading level={1} className="text-center mb-8">
        Pricing
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard
          title="Free"
          description="Basic access to journaling and community"
          price="$0"
          features={['Guided Journal', 'Community Forums', 'Limited Insights']}
          buttonText="Get Started"
          buttonVariant="secondary"
          href="/register"
        />
        <PricingCard
          title="Pro"
          description="Full analytics, advanced journal prompts"
          price="$9.99/mo"
          features={['All Free Features', 'Insight Dashboard', 'Unlimited Journaling', 'Priority Support']}
          buttonText="Choose Pro"
          buttonVariant="primary"
          href="/register"
        />
        <PricingCard
          title="Enterprise"
          description="Custom solutions for teams and organizations"
          price="Contact Us"
          features={['All Pro Features', 'Dedicated Account Manager', 'Custom Integrations']}
          buttonText="Contact Sales"
          buttonVariant="secondary"
          href="/register"
        />
      </div>
    </>
  );
}