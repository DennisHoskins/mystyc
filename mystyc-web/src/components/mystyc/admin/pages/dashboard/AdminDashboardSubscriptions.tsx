'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import SubscriberIcon from '@/components/mystyc/admin/ui/icons/SubscriberIcon'

export default function AdminDashboardSubscriptions({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

  return (
    <AdminDashboardItemLayout
      className='col-span-1 flex flex-col'
      icon={<SubscriberIcon />}
      title="Subscriptions"
      link="/admin/subscribers"
    >
      Subscriptions
    </AdminDashboardItemLayout>
  );
}