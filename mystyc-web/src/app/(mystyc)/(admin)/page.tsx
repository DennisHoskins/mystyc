'use client';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import List from '@/components/ui/list/List';
import ListItem from '@/components/ui/list/ListItem';
import ListItemButton from '@/components/ui/list/ListItemButton';

function AdminPage() {
  return (
    <PageContainer>
      <AdminBreadcrumbs />
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Manage administrative settings"
      />
      <div className="mt-8">
        <List columns={2} className="grid-cols-1 sm:grid-cols-2">
          <ListItem>
            <ListItemButton
              label="User Management"
              subtitle="View and manage user accounts"
              href="/admin/users"
            />
          </ListItem>
          <ListItem>
            <ListItemButton
              label="Devices"
              subtitle="View and manage devices"
              href="/admin/devices"
            />
          </ListItem>
          <ListItem>
            <ListItemButton
              label="Notifications"
              subtitle="Manage system notifications"
              href="/admin/notifications"
            />
          </ListItem>
          <ListItem>
            <ListItemButton
              label="Auth Events"
              subtitle="View authentication logs"
              href="/admin/auth-events"
            />
          </ListItem>
        </List>
      </div>
    </PageContainer>
  );
}

export default AdminPage;