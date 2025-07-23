'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import SubscriptionDetailsPanel from './SubscriptionDetailsPanel';
import SubscriptionUserPanel from './SubscriptionUserPanel';
import SubscriptionStripeCard from './SubscriptionStripeCard';

export default function SubscriptionPage({ subscriptionId }: { subscriptionId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [payment, setPayment] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayment = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getPayment(subscriptionId);
      setPayment(data);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SubscriptionPage');
      if (!wasSessionError) {
        logger.error('Failed to load subscription:', err);
        setError('Failed to load subscription. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [subscriptionId, setBusy, handleSessionError]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
    { label: subscriptionId },
  ], [subscriptionId]);

  if (loading) {
    return null;
  }

  if (!payment) {
    return (
      <AdminItemLayout
        error={'Subscription Not Found'}
        onRetry={loadPayment}
        breadcrumbs={breadcrumbs}
        icon={<SubscriptionsIcon size={6}/>}
        title={'Unkown Subscription'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadPayment}
      breadcrumbs={breadcrumbs}
      icon={<SubscriptionsIcon size={6} />}
      title={payment.stripeInvoiceId}
      headerContent={<SubscriptionDetailsPanel payment={payment} />}
      sidebarContent={<SubscriptionUserPanel firebaseUid={payment.firebaseUid} />}
      sectionsContent={[<SubscriptionStripeCard key='stripe' payment={payment} />]}
    />
  );
}