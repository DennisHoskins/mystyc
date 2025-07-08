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
import DailyContentDashboard from '../dashboard/DailyContentDashboard';

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
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setContent(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

      const data = await apiClientAdmin.getDailyContentStats();
      setData(data);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'DailyContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load daily content:', err);
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
   <AdminListLayout
      error={error}
      onRetry={() => loadContent(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={DailyContentIcon}
      title="Daily Content"
      description="Manage daily content entries: view, edit, and monitor generation status, sources, and performance metrics"
      sideContent={
        <DailyContentDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <DailyContentDashboard 
          key={'timeline'}
          data={data} 
          charts={['timeline']}
        />,
        <DailyContentDashboard 
          key={'performance'}
          data={data} 
          charts={['performance']}
        />,
        <DailyContentDashboard 
          key={'coverage'}
          data={data} 
          charts={['coverage']}
        />
      ]}
      tableContent={
        <DailyContentTable 
          data={content}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasMore={hasMore}
          onPageChange={loadContent}
          onRefresh={() => loadContent(currentPage)}
        />
      }
    />   
  );
}