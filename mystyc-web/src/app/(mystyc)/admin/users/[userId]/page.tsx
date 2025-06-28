'use client';

import { use } from 'react';
import UserPage from '@/components/app/mystyc/admin/content/users/user/UserPage';

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function Page({ params }: UserPageProps) {
  const { userId } = use(params);

  return <UserPage userId={userId} />
}