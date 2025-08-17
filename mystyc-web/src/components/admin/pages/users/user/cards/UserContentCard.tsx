'use client'

import { useEffect, useCallback, useState } from 'react';

import { Content } from 'mystyc-common/schemas';
import { getUserContent } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import ContentsCard from '../../../contents/ContentsCard';

export default function UserContentCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserContent = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }
      setError(null);
      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 1;
      listQuery.sortBy = 'createdAt';
      listQuery.sortOrder = 'desc'
      const response = await getUserContent({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});
      setContent(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserContent();
  }, [hasLoaded, loadUserContent]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load content'
        error={error}
        onRetry={() => loadUserContent()}
      />
    )
  }

  if (!content || !content.length) {
    return null;
  }

  return (
    <ContentsCard 
      content={content} 
      total={total} 
      href={`/admin/users/${firebaseUid}/content`} 
    />
  );
}