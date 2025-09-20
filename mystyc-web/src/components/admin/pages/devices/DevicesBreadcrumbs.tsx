import { DeviceView } from './DevicesPage';

interface DevicesBreadcrumbsProps {
  currentView: DeviceView;
  onClick?: () => void;
}

export default function DevicesBreadcrumbs({ currentView, onClick }: DevicesBreadcrumbsProps) {
  const baseBreadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices', onClick: onClick },
  ];

  if (currentView === 'summary') {
    return baseBreadcrumbs;
  }

  const viewLabels = {
    all: 'All',
    online: 'Online',
    offline: 'Offline'
  };

  return [
    ...baseBreadcrumbs,
    { label: viewLabels[currentView] }
  ];
}