'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DailyContent } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import DailyContentIcon from '@/components/app/mystyc/admin/ui/icons/DailyContentIcon';
import DailyContentDetailsPanel from './content/DailyContentDetailsPanel';
import DailyContentPreviewPanel from './content/DailyContentPreviewPanel';
import DailyContentSidebarPanel from './content/DailyContentSidebarPanel';
import DailyContentDataPanel from './content/DailyContentDataPanel';

export default function DailyContentPage({ contentId }: { contentId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<DailyContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getDailyContent(contentId);
      setContent(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'DailyContentPage');
      if (!wasSessionError) {
        logger.error('Failed to load content:', err);
        setError('Failed to load content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [contentId, setBusy, handleSessionError]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Daily Content', href: '/admin/daily-content' },
    { label: content ? content.date : `Content ${contentId}` },
  ], [content, contentId]);

  if (loading) {
    return null;
  }

  if (!content) {
    return (
      <AdminItemLayout
        error={'Content Not Found'}
        onRetry={loadContent}
        breadcrumbs={breadcrumbs}
        icon={<DailyContentIcon size={6}/>}
        title={'Unknown Content'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadContent}
      breadcrumbs={breadcrumbs}
      icon={<DailyContentIcon size={6}/>}
      title={content.title}
      headerContent={<DailyContentDetailsPanel content={content} />}
      sectionsContent={[<DailyContentPreviewPanel key='preview' content={content} />]}
      sidebarContent={<DailyContentSidebarPanel content={content} />}
      mainContent={<DailyContentDataPanel content={content} />}
    />
  );    
}