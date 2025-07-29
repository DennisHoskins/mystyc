import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.subscriptions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import SubscriptionsPage from '@/components/admin/pages/subscriptions/SubscriptionsPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <SubscriptionsPage />
    </AdminTransition>      
  )
}