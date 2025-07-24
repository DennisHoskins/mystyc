'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { UsersSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import UsersBreadcrumbs from './UsersBreadcrumbs';
import UsersDashboard from './UsersDashboard';
import UsersDashboardGrid from './UsersDashboardGrid';
import UsersSummaryPanel from './UsersSummaryPanel';
import UsersTable from './UsersTable';

export type UserView = 'summary' | 'all' | 'users' | 'plus';

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<UserStats> | null>(null);
  const [summary, setSummary] = useState<UsersSummary | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
  const getCurrentView = (): UserView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('users')) return 'users';
    if (searchParams.has('plus')) return 'plus';
    return 'summary';
  };

  const currentView = getCurrentView();
  const breadcrumbs = UsersBreadcrumbs({ currentView, onClick: () => { router.push("users"); }});
  const showUserTable = currentView !== 'summary';

  // Change URL without page reload
  const handleClick = (view: UserView) => {
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
      const summaryStats = await admin.users.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadUsers = useCallback(async (page: number) => {
    try {
      if (!showUserTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      } as const;

      let response: AdminListResponse<UserProfile>;
      
      switch (currentView) {
        case 'plus':
          response = await admin.users.getUsers("plus", query);
          break;
        case 'users':
          response = await admin.users.getUsers("users", query);
          break;
        case 'all':
          response = await admin.users.getUsers("all", query);
          break;
        default:
          return;
      }

      setUsers(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showUserTable, setBusy, currentView]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView == 'users' || currentView == 'plus' || currentView == 'all') loadUsers(0);
    else loadData();
  }, [loadData, loadUsers, currentView]);

  // Load stats and summary on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={UsersIcon}
      headerContent={
        <UsersSummaryPanel 
          summary={summary}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <UsersDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={showUserTable == false && <UsersDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showUserTable ?
            (
              <UsersTable
                loading = {admin.users.state.loading}
                data={users}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
                onPageChange={() => loadUsers(currentPage)}
                onRefresh={() => loadUsers(0)}
              />
            ) : (
              <div className='flex-1 flex'>
                <UsersDashboard 
                  key={'registrations'}
                  stats={stats} 
                  charts={['registrations']}
                />
              </div>
            )
          }
        </>
      }
    />
  );
}