'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { OpenAIRequest } from '@/interfaces';
import { logger } from '@/util/logger';

import OpenAIRequestDetailsPanel from "./OpenAIRequestDetailsPanel"

import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';
import FormError from '@/components/ui/form/FormError';

export default function OpenAIInfoPanel({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<OpenAIRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getOpenAIRequest(requestId);
      setRequest(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <AdminDetailGroup>
        <FormError message={error} />
      </AdminDetailGroup>
    );
  }

  if (!request) {
    return (
      <AdminDetailGroup>
        <FormError message='Request not found' />
      </AdminDetailGroup>
    );
  }

  return <OpenAIRequestDetailsPanel request={request} />
}