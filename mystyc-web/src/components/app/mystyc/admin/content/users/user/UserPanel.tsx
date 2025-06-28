'use client';

import { UserProfile } from '@/interfaces';

interface UserPanelProps {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export default function UserPanel({ 
  user, 
  loading, 
  error 
}: UserPanelProps) {

  return (
    <>
      {user && user.email}
    </>
  );
}