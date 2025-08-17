'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Content } from 'mystyc-common/schemas';
import { getContent } from '@/server/actions/admin/content';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentDetailsPanel from './ContentDetailsPanel';
import ContentGenerationCard from './ContentGenerationCard';
import ContentSourceCard from './ContentSourceCard';
import ContentDataCard from './ContentDataCard';

export default function ContentPage({ contentId }: { contentId: string }) {
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getContent({deviceInfo: getDeviceInfo(), contentId});
      setContent(data);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, contentId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Content', href: '/admin/content' },
    { label: content ? content.date : `` },
  ], [content]);

  const sideContent = content?.executionId || content?.notificationId || content?.userId 
    ? [<ContentSourceCard key='source' content={content} />]
    : null;

  return (
    <div className='flex flex-col grow'>
      <AdminItemLayout
        error={error}
        onRetry={loadContent}
        breadcrumbs={breadcrumbs}
        icon={<ContentIcon size={6}/>}
        title={content?.title ?? "Content"}
        headerContent={<ContentDetailsPanel content={content} />}
        sideContent={sideContent}
        itemsContent={[
          <div key='generation-data' className='flex-1 flex flex-col w-full space-y-1'>
            <ContentGenerationCard key='generation' content={content} />
            <ContentDataCard key='data' content={content} />
          </div>
        ]}
      />
    </div>
  );    
}