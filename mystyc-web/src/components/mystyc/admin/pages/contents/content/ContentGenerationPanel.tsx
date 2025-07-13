'use client';

import { Content } from '@/interfaces';


import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import OpenAIIcon from '@/components/mystyc/admin/ui/icons/OpenAIIcon';
import Card from '@/components/ui/Card';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ContentGenerationPanel({ content }: { content: Content }) {
  if (!content.scheduleId && !content.executionId && !content.userId) {
    return;
  }

  return (
    <Card>

      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={OpenAIIcon} />
        <div>
          <Heading level={5}>Generation Details</Heading>
        </div>
      </div>

      <hr className='pb-4' />

      <AdminDetailGroup>
        <AdminDetailField
          label="OpenAI Request ID"
          value={content.openAIRequestId || "-"}
          href={content.openAIRequestId ? `/admin/openai/${content.openAIRequestId}` : null}
        />
      </AdminDetailGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {content.scheduleId &&
          <AdminDetailGroup>
            <AdminDetailField
              label="Schedule"
              value={content.scheduleId || '-'}
              href={content.scheduleId ? `/admin/schedules/${content.scheduleId}` : null}
            />
          </AdminDetailGroup>
        }
        {content.executionId &&
          <AdminDetailGroup>
            <AdminDetailField
              label="Execution"
              value={content.executionId || '-'}
              href={content.executionId ? `/admin/schedule-executions/${content.executionId}` : null}
            />
          </AdminDetailGroup>
        }
        {content.userId &&
          <AdminDetailGroup>
            <AdminDetailField
              label="User"
              value={content.userId || '-'}
              href={content.userId ? `/admin/users/${content.userId}` : null}
            />
          </AdminDetailGroup>
        }
      </div>
   </Card>
  );
}