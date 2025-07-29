import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.users" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import AdminTransition from '@/components/ui/layout/transition/AdminTransition';
import UsersPage from '@/components/admin/pages/users/UsersPage';

export default async function Page() {
  return (
    <AdminTransition>
      <UsersPage />
    </AdminTransition>      
  )
}