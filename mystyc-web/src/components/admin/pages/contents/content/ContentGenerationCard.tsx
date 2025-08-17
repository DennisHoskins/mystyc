import { Content } from 'mystyc-common/schemas';
import Card from '@/components/ui/Card';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ContentSidebarPanel({ content }: { content: Content | null }) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!content?.openAIData?._id) {
    return null;
  }

  return (
    <Card className='flex-none'>
      <AdminPanelHeader
        icon={OpenAIIcon}
        heading='Content Generation'
      />
      <AdminDetailGrid cols={3}>
        <Panel>
          <AdminDetailField
            label="Id"
            value={content?.openAIData?._id}
          />
          <AdminDetailField
            label="Model"
            value={content?.openAIData?.model}
          />
          <AdminDetailField
            label="Sources"
            value={content && content?.sources && content?.sources.length ? "[" + content.sources.join(', ') + "]" : ""}
          />
        </Panel>
        <Panel>
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
        </Panel>
        <Panel>
          <AdminDetailField
            label="Generation Time"
            value={content && (formatDuration(content.generationDuration))}
          />
          <AdminDetailField
            label="Retries"
            value={content ? content?.openAIData?.retryCount || "0" : ""}
          />
        </Panel>
    </AdminDetailGrid>
    <AdminDetailGrid className='!mt-4'>
      <Panel>
        <AdminDetailField
          label="Prompt"
          type='description'
          value={content?.openAIData?.prompt}
        />
      </Panel>
    </AdminDetailGrid>
   </Card>
  );
}