'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { AuthEventStats, AuthEventsSummary } from 'mystyc-common/admin';
import { getAuthEventsSummaryStats, getAuthEvents, getAuthEventsByType } from '@/server/actions/admin/auth-events';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import AuthenticationsBreadcrumbs from './AuthenticationsBreadcrumbs';
import AuthenticationDashboard from './AuthenticationDashboard';
import AuthenticationsDashboardGrid from './AuthenticationsDashboardGrid';
import AuthenticationsTable from './AuthenticationsTable';

export type AuthenticationView = 'summary' | 'all' | 'create' | 'login' | 'logout' | 'server-logout';

export default function AuthenticationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AuthEventStats | null>(null);
  const [summary, setSummary] = useState<AuthEventsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): AuthenticationView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('create')) return 'create';
    if (searchParams.has('login')) return 'login';
    if (searchParams.has('logout')) return 'logout';
    if (searchParams.has('server-logout')) return 'server-logout';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = AuthenticationsBreadcrumbs({ currentView: activeTab as AuthenticationView, onClick: () => { router.push("authentication"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as AuthenticationView;
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
      const summaryStats = await getAuthEventsSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load authentication data:', err);
      setError('Failed to load authentication data. Please try again.');
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

  // Server action wrapper functions
  const getAllAuthEvents = useCallback((params: any) => {
    return getAuthEvents(params);
  }, []);

  const getCreateEvents = useCallback((params: any) => {
    return getAuthEventsByType({...params, type: "create"});
  }, []);

  const getLoginEvents = useCallback((params: any) => {
    return getAuthEventsByType({...params, type: "login"});
  }, []);

  const getLogoutEvents = useCallback((params: any) => {
    return getAuthEventsByType({...params, type: "logout"});
  }, []);

  const getServerLogoutEvents = useCallback((params: any) => {
    return getAuthEventsByType({...params, type: "server-logout"});
  }, []);

  const getSummaryCount = () => {
    if (!summary) return null;
    return summary?.total;
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
      label: 'All Events',
      count: summary?.total,
      hasCount: true
    },
    {
      id: 'create',
      label: 'Create',
      count: summary?.create,
      hasCount: true
    },
    {
      id: 'login',
      label: 'Login',
      count: summary?.login,
      hasCount: true
    },
    {
      id: 'logout',
      label: 'Logout',
      count: summary?.logout,
      hasCount: true
    },
    {
      id: 'server-logout',
      label: 'Server Logout',
      count: summary?.serverLogout,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <AuthenticationsDashboardGrid stats={stats} />
          <div className='flex-1 flex'>
            <AuthenticationDashboard 
              key={'duration'}
              stats={stats} 
              charts={['peak']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'all',
      content: (
        <AuthenticationsTable
          serverAction={getAllAuthEvents}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'create',
      content: (
        <AuthenticationsTable
          serverAction={getCreateEvents}
          onRefresh={loadData}
          hideEventTypeColumn={true}
        />
      )
    },
    {
      id: 'login',
      content: (
        <AuthenticationsTable
          serverAction={getLoginEvents}
          onRefresh={loadData}
          hideEventTypeColumn={true}
        />
      )
    },
    {
      id: 'logout',
      content: (
        <AuthenticationsTable
          serverAction={getLogoutEvents}
          onRefresh={loadData}
          hideEventTypeColumn={true}
        />
      )
    },
    {
      id: 'server-logout',
      content: (
        <AuthenticationsTable
          serverAction={getServerLogoutEvents}
          onRefresh={loadData}
          hideEventTypeColumn={true}
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={AuthenticationIcon}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <AuthenticationDashboard 
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