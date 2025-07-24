import { Content } from 'mystyc-common/schemas';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentSidebarPanel({ content }: { content: Content }) {
  if (!content || !content.openAIData) {
    return null;
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

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
        <AdminDetailGroup className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 overflow-hidden'>
          <AdminDetailField
            label="Model"
            value={content.openAIData.model}
          />
          <AdminDetailField
            label="Generation Time"
            value={formatDuration(content.generationDuration)}
          />
          <AdminDetailField
            label="Cost"
            value={`$${content.openAIData.cost}`}
          />
          <AdminDetailField
            label="Input Tokens"
            value={content.openAIData.inputTokens || "-"}
          />
          <AdminDetailField
            label="Output Tokens"
            value={content.openAIData.outputTokens || "-"}
          />
          <AdminDetailField
            label="Prompt"
            value={content.openAIData.prompt}
          />
          <AdminDetailField
            label="retries"
            value={content.openAIData.retryCount || "0"}
          />
        </AdminDetailGroup>
      </div>
   </div>
  );
}