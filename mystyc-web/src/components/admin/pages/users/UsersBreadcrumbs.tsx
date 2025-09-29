import { UserView } from './UsersPage';

interface UsersBreadcrumbsProps {
  currentView: UserView;
  onClick?: () => void;
}

export default function UsersBreadcrumbs({ currentView, onClick }: UsersBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    all: 'All',
    users: 'Free',
    plus: 'Plus'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}