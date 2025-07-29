import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.sessions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import SessionsPage from '@/components/admin/pages/sessions/SessionsPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <SessionsPage />
    </AdminTransition>      
  )
}