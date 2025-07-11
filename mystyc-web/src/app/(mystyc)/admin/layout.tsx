import type { Metadata } from 'next';

import AdminLayout from '@/components/mystyc/admin/ui/AdminLayout';

export async function generateMetadata(): Promise<Metadata> {
  const title = process.env.NODE_ENV === 'production' ? 'mystyc / admin' : 'mystyc-dev / admin';
  
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
