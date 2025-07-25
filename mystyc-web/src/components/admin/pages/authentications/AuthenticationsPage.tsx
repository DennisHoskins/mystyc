'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { AuthEvent } from 'mystyc-common/schemas/';
import { AuthEventStats, AuthEventsSummary, AdminListResponse, AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AuthenticationsBreadcrumbs from './AuthenticationsBreadcrumbs';
import AuthenticationDashboard from './AuthenticationDashboard';
import AuthenticationsDashboardGrid from './AuthenticationsDashboardGrid';
import AuthenticationsSummaryPanel from './AuthenticationsSummaryPanel';
import AuthenticationsTable from './AuthenticationsTable';

export type AuthenticationView = 'summary' | 'all' | 'create' | 'login' | 'logout' | 'server-logout';

export default function AuthenticationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<AuthEventStats> | null>(null);
  const [summary, setSummary] = useState<AuthEventsSummary | null>(null);
  const [data, setData] = useState<AdminListResponse<AuthEvent> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = (): AuthenticationView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('create')) return 'create';
    if (searchParams.has('login')) return 'login';
    if (searchParams.has('logout')) return 'logout';
    if (searchParams.has('server-logout')) return 'server-logout';
    return 'summary';
  };
  const currentView = getCurrentView();
  const breadcrumbs = AuthenticationsBreadcrumbs({ currentView, onClick: () => { router.push("authentication"); }});
  const showAuthTable = currentView !== 'summary';

  const handleClick = (view: AuthenticationView) => {
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

      const statsQuery = apiClientAdmin.getDefaultStatsQuery();
      const summaryStats = await apiClientAdmin.auth.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load authentication data:', err);
      setError('Failed to load authentication data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      if (!showAuthTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      let response: AdminListResponse<AuthEvent>;
      
      switch (currentView) {
        case 'create':
          response = await apiClientAdmin.auth.getAuthEventsByType("create", listQuery);
          break;
        case 'login':
          response = await apiClientAdmin.auth.getAuthEventsByType("login", listQuery);
          break;
        case 'logout':
          response = await apiClientAdmin.auth.getAuthEventsByType("logout", listQuery);
          break;
        case 'server-logout':
          response = await apiClientAdmin.auth.getAuthEventsByType("server-logout", listQuery);
          break;
        case 'all':
        default:
          response = await apiClientAdmin.auth.getAuthEvents(listQuery);
          break;
      }

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showAuthTable, setBusy, currentView]);

  useEffect(() => {
    if (currentView == 'create' || currentView == 'login' || currentView == 'logout' || currentView == 'server-logout' || currentView == 'all') loadAuthEvents(0);
    else loadData();
  }, [loadData, loadAuthEvents, currentView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={AuthenticationIcon}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      headerContent={
        <AuthenticationsSummaryPanel 
          summary={summary}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <AuthenticationDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={showAuthTable == false && <AuthenticationsDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showAuthTable ?
            (
              <AuthenticationsTable
                loading = {isBusy}
                data={data?.data}
                pagination={data?.pagination}
                currentPage={currentPage}
                onPageChange={() => loadAuthEvents(currentPage)}
                onRefresh={() => loadAuthEvents(0)}
              />
            ) : (
              <div className='flex-1 flex'>
                <AuthenticationDashboard 
                  key={'duration'}
                  stats={stats} 
                  charts={['duration']}
                />
              </div>
            )
          }
        </>
      }
    />
  );
}