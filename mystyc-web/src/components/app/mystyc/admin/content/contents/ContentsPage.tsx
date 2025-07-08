'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Content, ContentStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import ContentTable from './ContentTable';
import ContentIcon from '@/components/app/mystyc/admin/ui/icons/ContentIcon';
import ContentDashboard from '../dashboard/ContentDashboard';

export default function ContentPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content[]>([]);
  const [data, setData] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Content' },
  ];

  const loadContent = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getContents({
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

      const data = await apiClientAdmin.getContentStats();
      setData(data);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load content:', err);
        setError('Failed to load content. Please try again.');
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
      icon={ContentIcon}
      title=" Content"
      description="Manage content entries: view, edit, and monitor generation status, sources, and performance metrics"
      sideContent={
        <ContentDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <ContentDashboard 
          key={'timeline'}
          data={data} 
          charts={['timeline']}
        />,
        <ContentDashboard 
          key={'performance'}
          data={data} 
          charts={['performance']}
        />,
        <ContentDashboard 
          key={'coverage'}
          data={data} 
          charts={['coverage']}
        />
      ]}
      tableContent={
        <ContentTable 
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