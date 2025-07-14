'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { OpenAIRequest } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';
import FormError from '@/components/ui/form/FormError';
import { formatDateForDisplay } from '@/util/dateTime';

export default function OpenAIRequestDetailsPanel({ request }: { request: OpenAIRequest }) {
  if (!request) {
    return (
      <AdminDetailGroup>
        <FormError message='Request not found' />
      </AdminDetailGroup>
    );
  }

  const inputCost = (request.inputTokens / 1000) * 0.000075;
  const outputCost = (request.outputTokens / 1000) * 0.0003;
  const totalCost = (inputCost + outputCost).toFixed(6);

  return (
    <div className='@container flex-1 flex'>
      <AdminDetailGroup className='flex-1 grid grid-cols-1 @lg:grid-cols-2 @xxl:grid-cols-3'>

        {request.error && <FormError message={request.error} /> }
        
        <AdminDetailField
          label="Request Id"
          value={request._id}
          href={`/admin/openai/${request._id}`}
        />
        <AdminDetailField
          label="Created"
          value={formatDateForDisplay(request.createdAt)}
        />
        <AdminDetailField
          label="Request Type"
          value={request.requestType}
        />
        {request.requestType === 'notification_content' &&
          <AdminDetailField
            label="Notification Id"
            value={request.linkedEntityId}
            href={`/admin/notifications/${request.linkedEntityId}`}
          />
        }
        {request.requestType === 'website_content' &&
          <AdminDetailField
            label="Content Id"
            value={request.linkedEntityId}
            href={`/admin/content/${request.linkedEntityId}`}
          />
        }
        {request.requestType === 'user_content' &&
          <AdminDetailField
            label="User Id"
            value={request.linkedEntityId}
            href={`/admin/users/${request.linkedEntityId}`}
          />
        }
        <AdminDetailField
          label="Prompt"
          value={request.prompt.substring(0, 20) + "..."}
        />
        <AdminDetailField
          label="Model"
          value={request.model}
        />
        <AdminDetailField
          label="Input Tokens"
          value={request.inputTokens}
        />
        <AdminDetailField
          label="Ouptput Tokens"
          value={request.outputTokens}
        />
        <AdminDetailField
          label="Cost"
          value={request.cost + " / $" + totalCost}
        />
        <AdminDetailField
          label="Retries"
          value={request.retryCount || "0"}
        />
      </AdminDetailGroup>
    </div>
  );
}