import { Database } from 'lucide-react';

import { Content } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDataCard({ content }: { content: Content | null }) {
  return (
    <Card className='flex-1 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Database className='w-4 h-4'/>} />
        <div>
          <Heading level={5}>Data</Heading>
        </div>
      </div>

      <hr/>

      <AdminDetailGrid cols={1}>
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
        {content && content.data.map((d) => (
          <Card key={d.key} className='!shadow-sm'>
            <AdminDetailField
              label={d.key}
              value={d.value}
              type='description'
            />
          </Card>
        ))}
      </AdminDetailGrid>
    </Card>
  );
}