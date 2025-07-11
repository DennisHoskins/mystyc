'use client';

import { Content } from '@/interfaces';

import Card from '@/components/ui/Card';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ContentGenerationPanel({ content }: { content: Content }) {
  if (!content.scheduleId && !content.executionId) {
    return;
  }

  return (
    <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminDetailGroup>
        <AdminDetailField
          label="Schedule"
          value={content.scheduleId || '-'}
          href={content.scheduleId ? `/admin/schedules/${content.scheduleId}` : null}
        />
      </AdminDetailGroup>
      <AdminDetailGroup>
        <AdminDetailField
          label="Execution"
          value={content.executionId || '-'}
          href={content.executionId ? `/admin/schedules/${content.executionId}` : null}
        />
      </AdminDetailGroup>
   </Card>
  );
}