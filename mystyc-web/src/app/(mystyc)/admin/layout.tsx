import type { Metadata } from 'next';

import AdminLayout from '@/components/app/mystyc/admin/AdminLayout'

export async function generateMetadata(): Promise<Metadata> {
  const title = process.env.NODE_ENV === 'production' ? 'mystyc admin' : 'mystyc admin // dev';
  
  return {
    title
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
