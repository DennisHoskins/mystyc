'use client';

import { DailyContent } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function DailyContentDetailsPanel({ content }: { content: DailyContent }) {
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
      <div className="grid grid-cols-3 gap-6">
        <AdminDetailGroup>
          <AdminDetailField
            label="Status"
            value={
              <span className={`font-medium ${getStatusColor(content.status)}`}>
                {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
              </span>
            }
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
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
        </AdminDetailGroup>
      </div>
      
      {content.sources && content.sources.length > 0 && (
        <div className="mt-6">
          <AdminDetailGroup>
            <AdminDetailField
              label="Sources"
              value={content.sources.join(', ')}
            />
          </AdminDetailGroup>
        </div>
      )}
    </div>
  );
}