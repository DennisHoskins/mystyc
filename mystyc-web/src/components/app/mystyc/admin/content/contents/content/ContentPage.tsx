'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Content } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import ContentIcon from '@/components/app/mystyc/admin/ui/icons/ContentIcon';
import ContentDetailsPanel from './content/ContentDetailsPanel';
import ContentPreviewPanel from './content/ContentPreviewPanel';
import ContentSidebarPanel from './content/ContentSidebarPanel';
import ContentDataPanel from './content/ContentDataPanel';

export default function ContentPage({ contentId }: { contentId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getContent(contentId);
      setContent(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentPage');
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
    { label: 'Content', href: '/admin/content' },
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
        icon={<ContentIcon size={6}/>}
        title={'Unknown Content'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadContent}
      breadcrumbs={breadcrumbs}
      icon={<ContentIcon size={6}/>}
      title={content.title}
      headerContent={<ContentDetailsPanel content={content} />}
      sectionsContent={[<ContentPreviewPanel key='preview' content={content} />]}
      sidebarContent={<ContentSidebarPanel content={content} />}
      mainContent={<ContentDataPanel content={content} />}
    />
  );    
}