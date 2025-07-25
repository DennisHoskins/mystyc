'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Content } from 'mystyc-common/schemas/';
import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import { ContentsSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
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
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<ContentStats> | null>(null);
  const [summary, setSummary] = useState<ContentsSummary | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
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

  // Change URL without page reload
  const handleClick = (view: ContentView) => {
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
      const summaryStats = await admin.content.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load content data:', err);
      setError('Failed to load content data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.content]);

  const loadContents = useCallback(async (page: number) => {
    try {
      if (!showContentTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      } as const;

      let response: AdminListResponse<Content>;
      
      switch (currentView) {
        case 'notifications':
          response = await admin.content.getContents("notifications", query);
          break;
        case 'website':
          response = await admin.content.getContents("website", query);
          break;
        case 'users':
          response = await admin.content.getContents("users", query);
          break;
        case 'users-plus':
          response = await admin.content.getContents("users-plus", query);
          break;
        case 'all':
          response = await admin.content.getContents("all", query);
          break;
        default:
          return;
      }

      setContents(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showContentTable, setBusy, currentView, admin.content]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView == 'notifications' || currentView == 'website' || currentView == 'users' || currentView == 'users-plus' || currentView == 'all') loadContents(0);
    else loadData();
  }, [loadData, loadContents, currentView]);

  // Load stats and summary on mount
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
                loading = {admin.content.state.loading}
                data={contents}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
                onPageChange={() => loadContents(currentPage)}
                onRefresh={() => loadContents(0)}
                contentType={currentView}
              />
            ) : (
              <div className='flex-1 flex'>
                <ContentDashboard 
                  key={'performance'}
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