import { Content } from 'mystyc-common/schemas';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon';
import ContentGenerationPanel from './ContentGenerationPanel';

export default function ContentSidebarPanel({ content }: { content: Content }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={OpenAIIcon} />
        <div>
          <Heading level={5}>Content Generation</Heading>
        </div>
      </div>

      <hr/>

      <div className='mt-4'>
        <ContentGenerationPanel content={content} />
      </div>
   </div>
  );
}