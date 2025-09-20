import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscription" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SubscriptionPage from '@/components/admin/pages/subscriptions/subscription/SubscriptionPage';

export default async function Page({ params }: { params: Promise<{ subscriptionId: string; }> }) {
  const { subscriptionId } = await params;
  return <SubscriptionPage subscriptionId={subscriptionId} />;
}