import { Database } from 'lucide-react';

import { Content } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDataCard({ content }: { content: Content | null }) {

  let data = null;
  if (content?.data) {
    data = "[" + content.data.map((d) => d.key).join(", ") + "]";
  }

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={<Database className='w-4 h-4'/>} />
        <div>
          <Heading level={5}>Data</Heading>
        </div>
      </div>

      <hr/>

      <AdminDetailGrid cols={1} className='mt-4'>
        <AdminDetailField
          label="Prompt"
          value={content?.openAIData?.prompt}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={2} className='mt-4'>
        <AdminDetailField
          label="Title"
          value={content?.title}
        />
        <AdminDetailField
          label="Message"
          value={content && content.message.substring(0, 25) + "..."}
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
          label="Data"
          value={data}
        />
        <AdminDetailField
          label="Image URL"
          value={content?.imageUrl && content.imageUrl.substring(0, 50) + '...'}
          href={content?.imageUrl}
        />
      </AdminDetailGrid>
    </Card>
  );
}