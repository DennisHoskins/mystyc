'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { withAdminAuth } from '@/auth/withAdminAuth';

import PageContainer from '@/components/layout/PageContainer';
import Text from '@/components/ui/Text';

function AdminPage() {
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler({
    component: 'AdminPage',
    showToast: true
  });

  useEffect(() => {
    try {
      setBusy(false);
    } catch (err) {
      handleError(err, { action: 'initialization' });
    }
  }, [setBusy, handleError]);

  return (
    <PageContainer>
      <h2 className="mt-8 text-xl font-semibold text-center">Admin Dashboard</h2>
      <Text variant="muted" className="mt-2 text-center">Welcome, admin.</Text>
      
      <div className="mt-8 space-y-4">
        <Link 
          href="/admin/users" 
          className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium text-gray-900">User Management</h3>
          <Text variant="small">View and manage user accounts</Text>
        </Link>
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(AdminPage);