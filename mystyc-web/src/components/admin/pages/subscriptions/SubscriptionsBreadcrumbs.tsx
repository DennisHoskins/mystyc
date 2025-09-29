import { SubscriptionView } from './SubscriptionsPage';

interface SubscriptionsBreadcrumbsProps {
  currentView: SubscriptionView;
  onClick?: () => void;
}

export default function SubscriptionsBreadcrumbs({ currentView, onClick }: SubscriptionsBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Subscriptions', href: '/admin/subscriptions', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    payments: 'Payments',
    subscribers: 'Subscribers'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}