import { Content } from 'mystyc-common';

import Card from '@/components/ui/Card';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDataCard({ content }: { content: Content }) {
  if (!content.data || content.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <AdminDetailGroup className='space-y-4'>
        {content.data.map((item, index) => (
          <AdminDetailField
            key={index}
            label={item.key}
            value={item.value}
          />
        ))}
      </AdminDetailGroup>
    </Card>
  );
}