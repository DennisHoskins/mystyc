import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.payments" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserPaymentsPage from '@/components/admin/pages/users/user/pages/UserPaymentsPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserPaymentsPage firebaseUid={firebaseUid} />;
}