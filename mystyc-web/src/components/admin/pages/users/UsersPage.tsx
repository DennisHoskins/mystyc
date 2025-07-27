'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { UserStats, UsersSummary, AdminListResponse, AdminStatsQuery } from 'mystyc-common/admin';
import { getUsersSummaryStats, getAllUsers, getUsers, getPlusUsers } from '@/server/actions/admin/users';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
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
  
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [summary, setSummary] = useState<UsersSummary | null>(null);
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [data, setData] = useState<AdminListResponse<UserProfile> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = (): UserView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('users')) return 'users';
    if (searchParams.has('plus')) return 'plus';
    return 'summary';
  };
  const currentView = getCurrentView();
  const breadcrumbs = UsersBreadcrumbs({ currentView, onClick: () => { router.push("users"); }});
  const showUserTable = currentView !== 'summary';

  const handleClick = (view: UserView) => {
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

  const loadUsers = useCallback(async (page: number) => {
    try {
      if (!showUserTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      let response: AdminListResponse<UserProfile>;
      
      switch (currentView) {
        case 'plus':
          response = await getPlusUsers({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'users':
          response = await getUsers({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'all':
        default:
          response = await getAllUsers({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
      }

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showUserTable, setBusy, currentView]);

  useEffect(() => {
    if (currentView == 'users' || currentView == 'plus' || currentView == 'all') loadUsers(0);
    else loadData();
  }, [loadData, loadUsers, currentView]);

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
          query={query} 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={
        showUserTable == false && <UsersDashboardGrid query={query} stats={stats} />
      }
      tableContent={
        <>
          {showUserTable ?
            (
              <UsersTable
                loading = {isBusy}
                data={data?.data}
                pagination={data?.pagination}
                currentPage={currentPage}
                onPageChange={() => loadUsers(currentPage)}
                onRefresh={() => loadUsers(0)}
              />
            ) : (
              <div className='flex-1 flex'>
                <UsersDashboard 
                  key={'registrations'}
                  query={query} 
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