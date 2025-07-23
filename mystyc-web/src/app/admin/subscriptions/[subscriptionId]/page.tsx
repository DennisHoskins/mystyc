import { use } from 'react';

import SubscriptionPage from '@/components/admin/pages/subscriptions/subscription/SubscriptionPage';

interface SubscriptionPageProps {
  params: Promise<{
    subscriptionId: string;
  }>;
}

export default function Page({ params }: SubscriptionPageProps) {
  const { subscriptionId } = use(params);

  return <SubscriptionPage subscriptionId={subscriptionId} />
}