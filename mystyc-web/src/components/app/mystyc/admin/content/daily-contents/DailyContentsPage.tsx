'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DailyContent, DailyContentStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import DailyContentTable from './DailyContentTable';
import DailyContentIcon from '@/components/app/mystyc/admin/ui/icons/DailyContentIcon';

export default function DailyContentPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<DailyContent[]>([]);
  const [data, setData] = useState<DailyContentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Daily Content' },
  ];

  const loadContent = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getDailyContents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setContent(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

      const data = await apiClientAdmin.getDailyContentStats();
      setData(data);

console.log(data);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'DailyContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load users:', err);
        setError('Failed to load daily content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadContent(0);
  }, [loadContent]);

  return (
    <>
    <p>{data ? data.summary.totalEvents : ""}</p>
   <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={DailyContentIcon}
      description="Manage daily content entries: view, edit, and monitor generation status, sources, and performance metrics"
      tableContent={
        <DailyContentTable 
          data={content}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasMore={hasMore}
          onPageChange={loadContent}
          onRetry={() => loadContent(currentPage)}
          onRefresh={() => loadContent(currentPage)}
        />
      }
    />
    </>    
  );
}