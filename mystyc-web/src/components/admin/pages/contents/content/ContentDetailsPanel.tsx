import { Content } from 'mystyc-common';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDetailsPanel({ content }: { content: Content | null }) {
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

  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={2}>
        <AdminDetailField
          label="Status"
          value={content &&
            <span className={`font-medium ${getStatusColor(content.status)}`}>
              {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
            </span>
          }
        />
        <AdminDetailField
          label="Generated At"
          value={content?.generatedAt ? formatTimestampForComponent(new Date(content.generatedAt).getTime()) : ''}
        />
        <AdminDetailField
          label="Date"
          value={content?.date}
        />
        <AdminDetailField
          label="Sources"
          value={content && content?.sources && content?.sources.length ? "[" + content.sources.join(', ') + "]" : ""}
        />
        <AdminDetailField
          label="Type"
          value={content?.type}
        />
        <AdminDetailField
          label="Source"
          value={
            content?.userId ? content?.userId : 
            content?.executionId ? content?.executionId : 
            content?.notificationId ? content?.notificationId : 
            content ? "-" : ""
          }
          href={
            content?.userId ? `/admin/users/${content?.userId}` :
            content?.executionId ? `/admin/schedule-executions/${content?.executionId}` :
            content?.notificationId ? `/admin/notifications/${content?.notificationId}` :
            null
          }
        />
      </AdminDetailGrid>
    </div>
  );
}