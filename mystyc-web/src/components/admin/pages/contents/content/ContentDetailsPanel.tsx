import { Content } from 'mystyc-common';
import { formatTimestampForComponent } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';
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
    <AdminDetailGrid cols={2}>
      <Panel>
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
      </Panel>
      <Panel>
        <AdminDetailField
          label="Date"
          value={content?.date}
        />
        <AdminDetailField
          label="Type"
          value={content?.type}
        />
      </Panel>        
    </AdminDetailGrid>
  );
}