'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Content } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminError from '@/components/mystyc/admin/ui/AdminError';
import ContentTable from './ContentTable';

export default function AllContentTable({ isActive = false } : { isActive: boolean }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadAllContent = useCallback(async (page: number) => {
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
      setHasLoaded(true);
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

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadAllContent(0);
    }
  }, [isActive, hasLoaded, loadAllContent]);

  // Show loading state if tab is active but hasn't loaded yet
  if (isActive && !hasLoaded && !loading) {
    return null;
  }

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

  if (error) {
    return (
        <AdminError 
          title={"Unable to load content"}
          error={error} 
          onRetry={() => loadAllContent(0)}
        />
    )
  }

  return (
    <ContentTable
      data={content}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={loadAllContent}
      onRefresh={() => loadAllContent(currentPage)}
    />
  );
}