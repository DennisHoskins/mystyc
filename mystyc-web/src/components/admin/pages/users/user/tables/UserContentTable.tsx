'use client';

import { useEffect, useCallback, useState } from 'react';

import { Content } from 'mystyc-common/schemas/content.schema';
import { Pagination } from 'mystyc-common/admin';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import ContentTable from '@/components/admin/pages/contents/ContentTable';

interface UserContentTableProps {
  firebaseUid?: string | null;
  isActive?: boolean;
}

export default function UserContent({ firebaseUid, isActive = false }: UserContentTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [content, setContent] = useState<Content[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserContent = useCallback(async (page: number) => {
    try {
      if (!firebaseUid) {
        return;
      }
      
      setBusy(1000);
      setError(null);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      const response = await apiClientAdmin.users.getUserContent(firebaseUid, listQuery);

      setContent(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserContent(0);
    }
  }, [isActive, hasLoaded, loadUserContent]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load user content'
        error={error}
        onRetry={() => loadUserContent(0)}
      />
    )
  }

  return (
    <ContentTable
      data={content}
      hideSourceColumn={true}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      pagination={pagination}
      onPageChange={loadUserContent}
      onRefresh={() => loadUserContent(currentPage)}
    />
  );
}