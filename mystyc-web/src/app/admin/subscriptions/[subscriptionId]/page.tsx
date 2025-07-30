import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscription" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import SubscriptionPage from '@/components/admin/pages/subscriptions/subscription/SubscriptionPage';

export default function Page({ params }: { params: Promise<{ subscriptionId: string; }> }) {
  const { subscriptionId } = use(params);
  return <SubscriptionPage subscriptionId={subscriptionId} />;
}