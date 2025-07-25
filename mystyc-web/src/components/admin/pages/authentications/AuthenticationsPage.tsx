'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { AuthEvent } from 'mystyc-common/schemas/';
import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import { AuthEventsSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

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
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<AuthEventStats> | null>(null);
  const [summary, setSummary] = useState<AuthEventsSummary | null>(null);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
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

  // Change URL without page reload
  const handleClick = (view: AuthenticationView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    
    // For query params without values, manually construct
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const summaryStats = await admin.auth.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load authentication data:', err);
      setError('Failed to load authentication data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.auth]);

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      if (!showAuthTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'clientTimestamp',
        sortOrder: 'desc',
      } as const;

      let response: AdminListResponse<AuthEvent>;
      
      switch (currentView) {
        case 'create':
          response = await admin.auth.getAuthEvents("create", query);
          break;
        case 'login':
          response = await admin.auth.getAuthEvents("login", query);
          break;
        case 'logout':
          response = await admin.auth.getAuthEvents("logout", query);
          break;
        case 'server-logout':
          response = await admin.auth.getAuthEvents("server-logout", query);
          break;
        case 'all':
        default:
          // For 'all' view, we need a method that gets all events regardless of type
          response = await admin.auth.getAuthEvents("all", query);
          break;
      }

      setAuthEvents(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showAuthTable, setBusy, currentView, admin.auth]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView == 'create' || currentView == 'login' || currentView == 'logout' || currentView == 'server-logout' || currentView == 'all') loadAuthEvents(0);
    else loadData();
  }, [loadData, loadAuthEvents, currentView]);

  // Load stats and summary on mount
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
                loading = {admin.auth.state.loading}
                data={authEvents}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
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