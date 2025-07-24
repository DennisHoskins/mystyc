'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Content } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentDetailsPanel from './ContentDetailsPanel';
import ContentSidebarPanel from './ContentSidebarPanel';
import ContentDataCard from './ContentDataCard';
import UserInfoCard from '../../users/user/UserInfoCard';
import ContentPreviewCard from './ContentPreviewCard';
import ContentDataPreviewCard from './ContentDataPreviewCard';

export default function ContentPage({ contentId }: { contentId: string }) {
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.content.getContent(contentId);
      setContent(data);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [contentId, setBusy]);

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
      sectionsContent={[
        <ContentDataCard key='data' content={content} />,
        <span key="user">{content.type == "plus_content" && content.userId && <UserInfoCard firebaseUid={content.userId} />}</span>,
      ]}
      sidebarContent={<ContentSidebarPanel content={content} />}
      mainContent={[
        <ContentPreviewCard key='preview' content={content} />,
        <ContentDataPreviewCard key='content' content={content} />
    ]}
    />
  );    
}