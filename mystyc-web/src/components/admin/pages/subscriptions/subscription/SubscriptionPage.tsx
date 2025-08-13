'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { getPayment } from '@/server/actions/admin/payments';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import SubscriptionDetailsPanel from './SubscriptionDetailsPanel';
import SubscriptionUserCard from './SubscriptionUserCard';
import SubscriptionStripeCard from './SubscriptionStripeCard';

export default function SubscriptionPage({ subscriptionId }: { subscriptionId: string }) {
  const { setBusy } = useBusy();
  const [payment, setPayment] = useState<PaymentHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPayment = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getPayment({deviceInfo: getDeviceInfo(), paymentId: subscriptionId});
      setPayment(data);

    } catch (err) {
      logger.error('Failed to load subscription:', err);
      setError('Failed to load subscription. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [subscriptionId, setBusy]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
    { label: subscriptionId },
  ], [subscriptionId]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadPayment}
      breadcrumbs={breadcrumbs}
      icon={<SubscriptionsIcon size={6} />}
      title={payment?.stripeInvoiceId ?? "Payment"}
      headerContent={<SubscriptionDetailsPanel payment={payment} />}
      sideContent={<SubscriptionStripeCard key='stripe' payment={payment} />}
      mainContent={<SubscriptionUserCard firebaseUid={payment?.firebaseUid} />}
    />
  );
}