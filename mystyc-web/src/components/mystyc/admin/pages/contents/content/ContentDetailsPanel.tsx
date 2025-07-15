'use client';

import { Content } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ContentDetailsPanel({ content }: { content: Content }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'fallback':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className='min-h-10'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminDetailGroup>
          <AdminDetailField
            label="Status"
            value={
              <span className={`font-medium ${getStatusColor(content.status)}`}>
                {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
              </span>
            }
          />
          <AdminDetailField
            label="Generated At"
            value={content.generatedAt ? formatTimestampForComponent(new Date(content.generatedAt).getTime()) : '-'}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Generation Time"
            value={formatDuration(content.generationDuration)}
          />
          {content.sources && content.sources.length > 0 && (
            <AdminDetailField
              label="Sources"
              value={content.sources.join(', ')}
            />
          )}
        </AdminDetailGroup>

        <AdminDetailGroup>
          <AdminDetailField
            label="Date"
            value={content.date}
          />
          <AdminDetailField
            label="Title"
            value={content.title}
          />
          {content.sources && content.sources.length > 0 && (
            <AdminDetailField
              label="Message"
              value={content.message.substring(0, 25) + "..."}
            />
          )}
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
            {content.imageUrl && (
              <AdminDetailField
                label="Image URL"
                value={content.imageUrl.substring(0, 50) + '...'}
                href={content.imageUrl}
              />
            )}
          </AdminDetailGroup>
        )}
      </div>
    </div>
  );
}