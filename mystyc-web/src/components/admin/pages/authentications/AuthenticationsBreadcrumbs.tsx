import { AuthenticationView } from './AuthenticationsPage';

interface AuthenticationsBreadcrumbsProps {
  currentView: AuthenticationView;
  onClick?: () => void;
}

export default function AuthenticationsBreadcrumbs({ currentView, onClick }: AuthenticationsBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Authentication', href: '/admin/authentication', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    all: 'All Events',
    create: 'Create Events',
    login: 'Login Events',
    logout: 'Logout Events',
    'server-logout': 'Server Logout Events'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}