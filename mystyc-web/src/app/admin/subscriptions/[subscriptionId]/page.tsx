import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscription" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import SubscriptionPage from '@/components/admin/pages/subscriptions/subscription/SubscriptionPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface SubscriptionPageProps {
  params: Promise<{ subscriptionId: string; }>;
}

export default function Page({ params }: SubscriptionPageProps) {
  const { subscriptionId } = use(params);

  return (
    <AdminTransition>
      <SubscriptionPage subscriptionId={subscriptionId} />
    </AdminTransition>      
  )
}