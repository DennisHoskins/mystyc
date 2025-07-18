'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserStats, UserProfile } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UsersTable from './UsersTable';

export default function UsersTabPanel() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [activeTab, setActiveTab] = useState('content');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersPlus, setUsersPlus] = useState<UserProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 20;

  const loadUsers = useCallback(async (type: string, page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      let response;

      if (type == 'users') {
        response = await apiClientAdmin.getUsers({
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });

        setUsers(response.data);
      } else {
        response = await apiClientAdmin.getPlusUsers({
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });

        setUsersPlus(response.data);
      }

      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load users:', err);
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadUsers(activeTab, currentPage);
  }, [activeTab])

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'users',
        label: 'User',
        count: 0,
        content: (
          <UsersTable 
            data={users}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            hasMore={hasMore}
            onPageChange={() => loadUsers("user", 0)}
            onRefresh={() => loadUsers("user", currentPage)}
          />
        )
      },
      {
        id: 'users-plus',
        label: 'Plus',
        count: 0,
        content: (
          <UsersTable 
            data={users}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            hasMore={hasMore}
            onPageChange={() => loadUsers("plus", 0)}
            onRefresh={() => loadUsers("plus", currentPage)}
          />
        )
      }
    ];
  }, [activeTab]);

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      height="900px"
      onTabChange={setActiveTab}
    />
  );
}