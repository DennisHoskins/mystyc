import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.devices" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import DevicesPage from '@/components/admin/pages/devices/DevicesPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <DevicesPage />
    </AdminTransition>      
  )
}