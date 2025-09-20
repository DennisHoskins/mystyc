'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { UserStats, UsersSummary, AdminStatsQuery } from 'mystyc-common/admin';
import { getUsersSummaryStats, getAllUsers, getUsers, getPlusUsers } from '@/server/actions/admin/users';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import UsersBreadcrumbs from './UsersBreadcrumbs';
import UsersDashboard from './UsersDashboard';
import UsersDashboardGrid from './UsersDashboardGrid';
import UsersTable from './UsersTable';

export type UserView = 'summary' | 'all' | 'users' | 'plus';

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [summary, setSummary] = useState<UsersSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): UserView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('users')) return 'users';
    if (searchParams.has('plus')) return 'plus';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = UsersBreadcrumbs({ currentView: activeTab as UserView, onClick: () => { router.push("users"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as UserView;
    setActiveTab(tabId);
    
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const summaryStats = await getUsersSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setActiveTab(getCurrentView());
  }, [searchParams, getCurrentView]);

  const getSummaryCount = () => {
    if (!summary) return null;
    const total = summary?.total || 0;
    const plus = summary?.plus || 0;
    if (total === 0) return "0%";
    const percentage = (plus / total * 100).toFixed(1);
    return `${percentage}%`;
  };

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
      count: getSummaryCount(),
      hasCount: true
    },
    {
      id: 'all',
      label: 'All Users',
      count: summary?.total,
      hasCount: true
    },
    {
      id: 'users',
      label: 'Users',
      count: summary?.users,
      hasCount: true
    },
    {
      id: 'plus',
      label: 'Plus',
      count: summary?.plus,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <UsersDashboardGrid query={query} stats={stats} />
          <div className='flex-1 flex'>
            <UsersDashboard 
              key={'registrations'}
              query={query} 
              stats={stats} 
              charts={['registrations']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'all',
      content: (
        <UsersTable
          key='all'
          serverAction={getAllUsers}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'users',
      content: (
        <UsersTable
          key='users'
          serverAction={getUsers}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'plus',
      content: (
        <UsersTable
          key='plus'
          serverAction={getPlusUsers}
          onRefresh={loadData}
        />
      )
    }
  ];

  return (
    <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={UsersIcon}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <UsersDashboard
          query={query} 
          stats={stats} 
          charts={['stats']}
        />
      }
      mainContent={
        <TabPanel 
          tabs={tabContents}
          activeTab={activeTab}
        />
      }
    />
  );
}