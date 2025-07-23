'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UsersTable from './UsersTable';
import FormError from '@/components/ui/form/FormError';

type UserType = 'users' | 'plus' | 'all';

interface UsersSummary {
  users: number;
  plus: number;
  total: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  loaded: boolean;
}

export default function UsersTabPanel() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [activeTab, setActiveTab] = useState<UserType>('all');
  const [summary, setSummary] = useState<UsersSummary | null>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersUsers, setUsersUsers] = useState<UserProfile[]>([]);
  const [usersPlus, setUsersPlus] = useState<UserProfile[]>([]);

  // Track pagination state per user type
  const [paginationState, setPaginationState] = useState<Record<UserType, PaginationState>>({
    users: { currentPage: 0, totalPages: 0, totalItems: 0, hasMore: true, loaded: false },
    plus: { currentPage: 0, totalPages: 0, totalItems: 0, hasMore: true, loaded: false },
    all: { currentPage: 0, totalPages: 0, totalItems: 0, hasMore: true, loaded: false }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 20;

  const loadUsers = useCallback(async (type: UserType, page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

       let response: AdminListResponse<UserProfile>;

      if (type === 'users') {
        response = await apiClientAdmin.users.getUsers({
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });
        setUsersUsers(response.data);
      } else if (type === 'plus') {
        response = await apiClientAdmin.users.getPlusUsers({
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });
        setUsersPlus(response.data);
      } else if (type === 'all') {
        response = await apiClientAdmin.users.getAll({
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });
        setUsers(response.data);
      }

      // Update pagination for this specific type
      setPaginationState(prev => ({
        ...prev,
        [type]: {
          currentPage: page,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          hasMore: response.pagination.hasMore,
          loaded: true
        }
      }));

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

  // Load default tab on mount
  useEffect(() => {
    loadUsers(activeTab, 0);
  }, [loadUsers, activeTab]);

  // Load summary data (all counts)
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.users.getSummary();
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load users summary:', err);
      }
    };

    loadSummary();
  }, []);


  // Load data when tab changes (only if not already loaded)
  useEffect(() => {
    if (!paginationState[activeTab].loaded) {
      loadUsers(activeTab, 0);
    }
  }, [activeTab, paginationState, loadUsers]);

  const getUserData = useCallback((type: UserType): UserProfile[] => {
    switch(type) {
      case 'users': return usersUsers;
      case 'plus': return usersPlus;
      case 'all': return users;
      default: return [];
    }
  }, [users, usersUsers, usersPlus]);

  const handlePageChange = useCallback((type: UserType, page: number) => {
    loadUsers(type, page);
  }, [loadUsers]);

  const handleRefresh = useCallback((type: UserType) => {
    loadUsers(type, paginationState[type].currentPage);
  }, [loadUsers, paginationState]);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'all',
        label: 'All Users',
        count: summary?.total,
        content: (
          <UsersTable 
            data={getUserData('all')}
            loading={loading}
            currentPage={paginationState.all.currentPage}
            totalPages={paginationState.all.totalPages}
            totalItems={paginationState.all.totalItems}
            hasMore={paginationState.all.hasMore}
            onPageChange={(page) => handlePageChange('all', page)}
            onRefresh={() => handleRefresh('all')}
          />
        )
      },
      {
        id: 'users',
        label: 'Users',
        count: summary?.users,
        content: (
          <UsersTable 
            data={getUserData('users')}
            loading={loading}
            currentPage={paginationState.users.currentPage}
            totalPages={paginationState.users.totalPages}
            totalItems={paginationState.users.totalItems}
            hasMore={paginationState.users.hasMore}
            onPageChange={(page) => handlePageChange('users', page)}
            onRefresh={() => handleRefresh('users')}
            hideSubscriptionColumn={true}
          />
        )
      },
      {
        id: 'plus',
        label: 'Plus',
        count: summary?.plus,
        content: (
          <UsersTable 
            data={getUserData('plus')}
            loading={loading}
            currentPage={paginationState.plus.currentPage}
            totalPages={paginationState.plus.totalPages}
            totalItems={paginationState.plus.totalItems}
            hasMore={paginationState.plus.hasMore}
            onPageChange={(page) => handlePageChange('plus', page)}
            onRefresh={() => handleRefresh('plus')}
            hideSubscriptionColumn={true}
          />
        )
      },
    ];
  }, [getUserData, loading, paginationState, summary, handlePageChange, handleRefresh]);

  if (error) {
    return (
      <FormError message={error} />
    )
  }

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      height="900px"
      onTabChange={(tabId) => setActiveTab(tabId as UserType)}
    />
  );
}