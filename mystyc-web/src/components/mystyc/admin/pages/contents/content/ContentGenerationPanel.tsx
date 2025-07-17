'use client';

import { Content } from '@/interfaces';

import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ContentGenerationPanel({ content }: { content?: Content }) {
  if (!content || !content.openAIData) {
    return null;
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <AdminDetailGroup className='grid gird-cols-1 md:grid-cols-2 lg:grid-cols-1 overflow-hidden'>
      <AdminDetailField
        label="Model"
        value={content.openAIData.model}
      />
      <AdminDetailField
        label="Type"
        value={content.type}
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
  );
}
