'use client';

import { use } from 'react';
import UserPage from '@/components/app/mystyc/admin/content/users/user/UserPage';

interface UserPageProps {
  params: Promise<{
    firebaseUid: string;
  }>;
}

export default function Page({ params }: UserPageProps) {
  const { firebaseUid } = use(params);

  return <UserPage firebaseUid={firebaseUid} />
}