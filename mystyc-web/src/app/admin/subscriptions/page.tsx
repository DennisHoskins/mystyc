import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscriptions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SubscriptionsPage from '@/components/admin/pages/subscriptions/SubscriptionsPage';

export default function Page() {
  return <SubscriptionsPage />;
}