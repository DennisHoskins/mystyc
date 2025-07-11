'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';

import AdminHome from '@/components/mystyc/admin/AdminHome';

export default function Page() {
  const user = useUser();
  const isAdmin = user && user.isAdmin;

  if (!isAdmin) {
    return null;
  }

  return <AdminHome />
}