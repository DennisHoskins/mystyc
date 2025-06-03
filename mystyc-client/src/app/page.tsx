'use client';

import { useAuth } from '@/components/context/AuthContext';
import PublicRoot from '@/components/root/PublicRoot';
import UserRoot from '@/components/root/UserRoot';

export default function Page() {
  const { firebaseUser, loading } = useAuth();

  if (loading) return null;

  return firebaseUser ? <UserRoot /> : <PublicRoot />;
}
