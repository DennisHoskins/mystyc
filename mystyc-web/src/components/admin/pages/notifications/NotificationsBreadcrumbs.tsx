import { NotificationView } from './NotificationsPage';

interface NotificationsBreadcrumbsProps {
  currentView: NotificationView;
  onClick?: () => void;
}

export default function NotificationsBreadcrumbs({ currentView, onClick }: NotificationsBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications', href: '/admin/notifications', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    all: 'All Notifications',
    scheduled: 'Scheduled',
    user: 'User',
    broadcast: 'Broadcast'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}