import { Content } from 'mystyc-common/schemas';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentSidebarPanel({ content }: { content: Content | null }) {
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

      <AdminDetailGrid cols={1} className='mt-4'>
        <AdminDetailField
          label="Id"
          value={content?.openAIData?._id}
        />
        <AdminDetailField
          label="Model"
          value={content?.openAIData?.model}
        />
        <AdminDetailField
          label="Generation Time"
          value={content && (formatDuration(content.generationDuration))}
        />
        <AdminDetailField
          label="Retries"
          value={content ? content?.openAIData?.retryCount || "0" : ""}
        />
        <AdminDetailField
          label="Input Tokens"
          value={content?.openAIData?.inputTokens}
        />
        <AdminDetailField
          label="Output Tokens"
          value={content?.openAIData?.outputTokens}
        />
        <AdminDetailField
          label="Cost"
          value={content && content.openAIData ? `$${content.openAIData.cost}` : ""}
        />
     </AdminDetailGrid>
   </div>
  );
}