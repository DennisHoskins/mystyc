'use client';

import { useState, useEffect, useCallback } from 'react';

import { Clock } from 'lucide-react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { OpenAIUsage } from '@/interfaces';
import { logger } from '@/util/logger';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';
import { formatDateForComponent } from '@/util/dateTime';

export default function OpenAIUsageInfoPanel() {
  const [usage, setUsage] = useState<OpenAIUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getOpenAIUsage();
      setUsage(data);

      console.log(data);

    } catch (err) {
      logger.error('Failed to load openai usage:', err);
      setError('Failed to load openai usage. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <Heading level={5}>Loading Usage...</Heading>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-4">
        <Heading level={5} className='text-red-400'>{error}</Heading>
      </div>
    )
  }

  if (!usage) {
    return (
      <div className="flex items-center space-x-4">
        <Heading level={5} className='text-red-400'>OpenAI Usage not found</Heading>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className='flex-1 flex justify-center space-x-2'>
        <Heading level={5} className='mb-4 flex-1'>Usage {usage.month}</Heading>
        <Clock className='w-4 h-4'/>
        <Text variant='small'>LastSync: {formatDateForComponent(usage.lastSyncedAt)}</Text>
      </div>
       <hr />
      <AdminDetailGroup className='mt-4 grid grid-cols-2'>
        <AdminDetailField
          label='Budget'
          value={`$${(usage.costBudget- usage.costUsed).toFixed(3)} / $${usage.costBudget}`}
        />
        <AdminDetailField
          label='Used'
          value={`$${usage.costUsed} / ${usage.costUsagePercent.toFixed(4)}%`}
        />
        <AdminDetailField
          label='Tokens'
          value={`${usage.tokenBudget - usage.tokensUsed} / ${usage.tokenBudget}`}
        />
        <AdminDetailField
          label='Used'
          value={usage.tokensUsed + " / " + usage.tokenUsagePercent.toFixed(4) + "%"}
        />
      </AdminDetailGroup>
    </div>

  );    
}