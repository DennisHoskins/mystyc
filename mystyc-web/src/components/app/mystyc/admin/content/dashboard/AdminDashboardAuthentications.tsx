'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardAuthentications({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

  return (
      <AdminDashboardItemLayout
        icon={<AuthenticationIcon />}
        title="Authentication"
        link="/admin/authentication"
      >
        <Link
          className='flex-1 flex flex-col'
          href='/admin/authentication'
        >
          <AuthenticationDashboard 
            stats={{
              data: stats.data.authEvents,
              query: stats.query,
              queryString: stats.queryString,
            }}
            charts={['stats', 'peak', 'duration']}
            height={100}
          />
        </Link>
      </AdminDashboardItemLayout>
    );
  }