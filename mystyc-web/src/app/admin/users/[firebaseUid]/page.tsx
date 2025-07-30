import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import UserPage from '@/components/admin/pages/users/user/UserPage';

export default function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = use(params);
  return <UserPage firebaseUid={firebaseUid} />;
}