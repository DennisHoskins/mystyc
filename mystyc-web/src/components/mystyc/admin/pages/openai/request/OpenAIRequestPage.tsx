'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { OpenAIRequest } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/mystyc/admin/ui/AdminItemLayout';
import OpenAIIcon from '@/components/mystyc/admin/ui/icons/OpenAIIcon';
import { formatDateForInput } from '@/util/dateTime';
import OpenAIRequestDetailsPanel from './OpenAIRequestDetailsPanel';

export default function OpenAIRequestPage({ requestId }: { requestId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [request, setRequest] = useState<OpenAIRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequest = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getOpenAIRequest(requestId);
      setRequest(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'OpenAiRequestPage');
      if (!wasSessionError) {
        logger.error('Failed to load request:', err);
        setError('Failed to load request. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [requestId, setBusy, handleSessionError]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI', href: '/admin/openai' },
    { 
      label: (request ? (request.requestType || `Request ${requestId}`) : ``) + " @ " + `${formatDateForInput(request?.createdAt)}`
    },
  ], [request, requestId]);

  if (loading) {
    return null;
  }

  if (!request) {
    return (
      <AdminItemLayout
        error={'Request Not Found'}
        onRetry={loadRequest}
        breadcrumbs={breadcrumbs}
        icon={<OpenAIIcon size={6}/>}
        title={'Unkown Request'}
      />
    );
  }

  return (
   <AdminItemLayout
      error={error}
      onRetry={loadRequest}
      breadcrumbs={breadcrumbs}
      icon={<OpenAIIcon size={6} />}
      title=""
      headerContent={<OpenAIRequestDetailsPanel request={request} />}
    />
  );
}