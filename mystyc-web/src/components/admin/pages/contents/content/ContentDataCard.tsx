import { Database } from 'lucide-react';

import { Content } from 'mystyc-common';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDataCard({ content }: { content: Content | null }) {
  return (
    <AdminCard
      icon={<Database className='w-4 h-4'/>}
      title='Data'
      className='flex-1 grow'
    >
      <Panel className='!mb-1'>
        <AdminDetailGrid>
          <AdminDetailField
            label="Title"
            value={content?.title}
          />
          <AdminDetailField
            label="Message"
            type='description'
            value={content?.message}
          />
          <AdminDetailField
            label="Link Text"
            value={content?.linkText}
          />
          <AdminDetailField
            label="Link URL"
            value={content?.linkUrl}
            href={content?.linkUrl}
          />
          <AdminDetailField
            label="Image URL"
            value={content?.imageUrl && content.imageUrl.substring(0, 50) + '...'}
            href={content?.imageUrl}
          />
        </AdminDetailGrid>
      </Panel>
      {content && content.data.map((d) => (
        <Panel key={d.key}>
          <AdminDetailField
            label={d.key}
            value={d.value}
            type='description'
          />
        </Panel>
      ))}
    </AdminCard>
  );
}