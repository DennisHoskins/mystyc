import type { Metadata } from 'next';
interface SubscriptionPageProps {
  params: Promise<{
    subscriptionId: string;
  }>;
}

import { use } from 'react';

import SubscriptionPage from '@/components/admin/pages/subscriptions/subscription/SubscriptionPage';

export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscription" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

export default function Page({ params }: SubscriptionPageProps) {
  const { subscriptionId } = use(params);

  return <SubscriptionPage subscriptionId={subscriptionId} />
}