import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { formatDateForDisplay } from '@/util/dateTime';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { IconComponent } from '@/components/ui/icons/Icon';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type UserServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<UserProfile>>;

interface UsersTableProps {
  icon?: IconComponent;
  label?: string;
  serverAction?: UserServerAction;
  onRefresh?: () => void;
  hideSubscriptionColumn?: boolean;
  users?: AdminListResponse<UserProfile> | null;
}

export default function UsersTable({
  icon,
  label,
  serverAction,
  onRefresh,
  hideSubscriptionColumn = false,
  users
}: UsersTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<UserProfile> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (page: number) => {
    if (!serverAction) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  const handleRefresh = () => {
    loadUsers(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (users) {
      setData(users);
      setCurrentPage(0);
      return;
    }
    loadUsers(0);
  }, [loadUsers, users, setData]);

  const baseColumns: Column<UserProfile>[] = [
    { key: 'email', header: 'Email', link: (u) => `/admin/users/${u.firebaseUid}` },
    { key: 'uid', header: 'Id', link: (u) => `/admin/users/${u.firebaseUid}`, render: (u) => u.firebaseUid.substring(0, 15) + '...' },
    { key: 'fullName', header: 'Name', render: (u) => (u.firstName && u.lastName) ? u.firstName + " " + u.lastName : 'Unnamed User' },
    { key: 'createdAt', header: 'Joined', align: 'right', render: (u) => formatDateForDisplay(u.createdAt) || '-' },
  ];

  const subscriptionColumn: Column<UserProfile> = { key: 'subscription', header: 'Subscription', align: 'center', render: (u) => u.subscription.level };

  const columns = hideSubscriptionColumn == true
    ? baseColumns 
    : [
        ...baseColumns.slice(0, -1),
        subscriptionColumn,
        baseColumns[baseColumns.length - 1]
      ];

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<UserProfile>
      icon={icon}
      label={label}
      data={data?.data}
      columns={columns}
      loading={isBusy}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      totalItems={data?.pagination?.totalItems || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Users found."
    />
  );
}