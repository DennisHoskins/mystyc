'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';

import AdminHome from '@/components/admin/AdminHome';

export default function AdminPage() {
  const user = useUser();
  const isAdmin = user && user.isAdmin;

  if (!isAdmin) {
    return null;
  }

  return <AdminHome />
}