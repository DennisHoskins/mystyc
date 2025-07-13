'use client';

import { Content } from '@/interfaces';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import ContentIcon from '@/components/mystyc/admin/ui/icons/ContentIcon';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ContentSidebarPanel({ content }: { content: Content }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={ContentIcon} />
        <div>
          <Heading level={5}>Content Details</Heading>
        </div>
      </div>

      <hr/>

      <div className="pt-4 space-y-6">
        <AdminDetailGroup>
          <AdminDetailField
            label="Content Date"
            value={content.date}
          />
          <AdminDetailField
            label="Content ID"
            value={content._id || '-'}
          />
        </AdminDetailGroup>

        {content.linkUrl && (
          <AdminDetailGroup>
            <AdminDetailField
              label="Link URL"
              value={content.linkUrl}
              href={content.linkUrl}
            />
            <AdminDetailField
              label="Link Text"
              value={content.linkText || 'Not set'}
            />
          </AdminDetailGroup>
        )}

        {content.imageUrl && (
          <AdminDetailGroup>
            <AdminDetailField
              label="Image URL"
              value={content.imageUrl.substring(0, 50) + '...'}
              href={content.imageUrl}
              text="View full URL"
            />
          </AdminDetailGroup>
        )}

        {/* Metadata */}
        <AdminDetailGroup>
          <AdminDetailField
            label="Created"
            value={content.createdAt ? new Date(content.createdAt).toLocaleString() : '-'}
          />
          <AdminDetailField
            label="Updated"
            value={content.updatedAt ? new Date(content.updatedAt).toLocaleString() : '-'}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}