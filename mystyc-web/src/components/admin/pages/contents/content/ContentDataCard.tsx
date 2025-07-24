import { Content } from 'mystyc-common';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentDataCard({ content }: { content: Content }) {
  if (!content.data || content.data.length === 0) {
    return null;
  }

  const cols = content.data.length;

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