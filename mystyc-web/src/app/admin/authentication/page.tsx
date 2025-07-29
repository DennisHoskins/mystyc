import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.auth-events" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import AuthenticationsPage from '@/components/admin/pages/authentications/AuthenticationsPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <AuthenticationsPage />
    </AdminTransition>      
  )
}