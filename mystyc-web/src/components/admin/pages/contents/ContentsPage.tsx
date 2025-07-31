'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Content } from 'mystyc-common/schemas/';
import { ContentsSummary, ContentStats, AdminStatsQuery, AdminListResponse } from 'mystyc-common/admin';
import { getContentsSummaryStats, getContents, getNotificationsContents, getWebsiteContents, getUserContents, getUserPlusContents } from '@/server/actions/admin/content';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentsBreadcrumbs from './ContentsBreadcrumbs';
import ContentDashboard from './ContentDashboard';
import ContentsDashboardGrid from './ContentsDashboardGrid';
import ContentsSummaryPanel from './ContentsSummaryPanel';
import ContentsTable from './ContentsTable';

export type ContentView = 'summary' | 'all' | 'notifications' | 'website' | 'users' | 'users-plus';

export default function ContentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy, isBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [summary, setSummary] = useState<ContentsSummary | null>(null);
  const [data, setData] = useState<AdminListResponse<Content> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = (): ContentView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('notifications')) return 'notifications';
    if (searchParams.has('website')) return 'website';
    if (searchParams.has('users')) return 'users';
    if (searchParams.has('users-plus')) return 'users-plus';
    return 'summary';
  };
  const currentView = getCurrentView();
  const breadcrumbs = ContentsBreadcrumbs({ currentView, onClick: () => { router.push("content"); }});
  const showContentTable = currentView !== 'summary';

  const handleClick = (view: ContentView) => {
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
      const summaryStats = await getContentsSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load content data:', err);
      setError('Failed to load content data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadContents = useCallback(async (page: number) => {
    try {
      if (!showContentTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      let response: AdminListResponse<Content>;
      
      switch (currentView) {
        case 'notifications':
          response = await getNotificationsContents({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'website':
          response = await getWebsiteContents({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'users':
          response = await getUserContents({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'users-plus':
          response = await getUserPlusContents({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'all':
          response = await getContents({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        default:
          return;
      }

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showContentTable, setBusy, currentView]);

  useEffect(() => {
    if (currentView == 'notifications' || currentView == 'website' || currentView == 'users' || currentView == 'users-plus' || currentView == 'all') loadContents(0);
    else loadData();
  }, [loadData, loadContents, currentView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      description="Manage content entries: view, edit, and monitor generation status, sources, and performance metrics"
      headerContent={
        <ContentsSummaryPanel 
          summary={summary}
          stats={stats}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <ContentDashboard 
          query={query}
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={showContentTable == false && <ContentsDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showContentTable ?
            (
              <ContentsTable
                loading = {isBusy}
                data={data?.data}
                pagination={data?.pagination}
                currentPage={currentPage}
                onPageChange={() => loadContents(currentPage)}
                onRefresh={() => loadContents(0)}
                contentType={currentView}
              />
            ) : (
              <div className='flex-1 flex'>
                <ContentDashboard 
                  key={'performance'}
                  query={query}
                  stats={stats} 
                  charts={['performance']}
                />
              </div>
            )
          }
        </>
      }
    />
  );
}