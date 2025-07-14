'use client';

import { Content } from '@/interfaces';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import OpenAIIcon from '@/components/mystyc/admin/ui/icons/OpenAIIcon';
import OpenAIRequestInfoPanel from '@/components/mystyc/admin/pages/openai/request/OpenAIRequestInfoPanel'
import FormError from '@/components/ui/form/FormError';

export default function ContentSidebarPanel({ content }: { content: Content }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={OpenAIIcon} />
        <div>
          <Heading level={5}>Content Generation Details</Heading>
        </div>
      </div>

      <hr/>

      {content.openAIRequestId ? (
        <div className='mt-4'>
          <OpenAIRequestInfoPanel requestId={content.openAIRequestId} />
        </div>
      ) : (
        <FormError message='Request not found' />
      )}
   </div>
  );
}