import { ContentView } from './ContentsPage';

interface ContentsBreadcrumbsProps {
  currentView: ContentView;
  onClick?: () => void;
}

export default function ContentsBreadcrumbs({ currentView, onClick }: ContentsBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Content', href: '/admin/content', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    all: 'All Content',
    notifications: 'Notifications',
    website: 'Website',
    users: 'Users',
    'users-plus': 'Users Plus'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}