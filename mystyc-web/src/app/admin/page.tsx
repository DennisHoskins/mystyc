import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.admin" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import AdminHome from '@/components/admin/AdminHome';

export default function AdminPage() {
  return <AdminHome />;
}