'use client';

import { useUser } from '@/components/layout/context/AppContext';

import AdminHome from '@/components/app/mystyc/admin/AdminHome';

export default function Page() {
  const user = useUser();
  const isAdmin = user && user.isAdmin;

  if (!isAdmin) {
    return null;
  }

  return <AdminHome />
}