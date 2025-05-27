'use client';

import { useEffect } from 'react';

import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { withAdminAuth } from '@/auth/withAdminAuth';

import PageContainer from '@/components/layout/PageContainer';

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
      <p className="mt-2 text-center text-gray-600">Welcome, admin.</p>
    </PageContainer>
  );
}

export default withAdminAuth(AdminPage);