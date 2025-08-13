'use client'

import { useEffect, useCallback, useState } from 'react';

import { Content } from 'mystyc-common/schemas';
import { getUserContent } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon'
import Capsule from '@/components/ui/Capsule';
import { formatDateForComponent } from '@/util/dateTime';

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
      listQuery.limit = 3;
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

  return (
    <Card className='flex flex-col space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={ContentIcon} />
        <Link href={`/admin/users/${firebaseUid}/content`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Content</Heading>
        </Link>          
      </div>
      {total &&
        <>
          <hr/ >
          {content.map((content) => (
            <Link 
              key={content._id} 
              href={`/admin/content/${content._id}`}
              className="flex !flex-row items-center space-x-4"
            >
              <Avatar size={'medium'} icon={(props) => <ContentIcon {...props} />} />
              <div className='overflow-hidden !mt-0'>
                <Heading level={4}>{content.type}</Heading>
                <Heading level={5}>Title: {content.title}</Heading>
                <Capsule label={formatDateForComponent(content.date)} />
              </div>
            </Link>
          ))}
          {total > content.length && <Capsule label={'Total ' + total} href={`/admin/users/${firebaseUid}/content`} />}
        </>
      }
    </Card>
  );
}