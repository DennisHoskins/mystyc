import React from 'react';
import { usePathname } from 'next/navigation';

import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsProps {
  entityName?: string; // For displaying user email, device ID, etc.
  className?: string;
}

export default function AdminBreadcrumbs({ entityName, className }: AdminBreadcrumbsProps) {
  const pathname = usePathname();
  
  // Parse the current path to build breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const items: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin' }
  ];

  // Build breadcrumbs based on path segments
  if (pathSegments.length > 1) {
    const section = pathSegments[1];
    
    switch (section) {
      case 'users':
        items.push({ label: 'Users', href: '/admin/users' });
        if (pathSegments[2] && entityName) {
          items.push({ label: entityName }); // Current user
        }
        break;
        
      case 'devices':
        items.push({ label: 'Devices', href: '/admin/devices' });
        if (pathSegments[2] && entityName) {
          items.push({ label: entityName }); // Current device
        }
        break;
        
      case 'auth-events':
        items.push({ label: 'Auth Events', href: '/admin/auth-events' });
        if (pathSegments[2] && entityName) {
          items.push({ label: entityName }); // Current auth event
        }
        break;
        
      case 'user':
        // Direct user link (e.g., from auth event)
        items.push({ label: 'Users', href: '/admin/users' });
        if (entityName) {
          items.push({ label: entityName });
        }
        break;
        
      case 'device':
        // Direct device link (e.g., from auth event)
        items.push({ label: 'Devices', href: '/admin/devices' });
        if (entityName) {
          items.push({ label: entityName });
        }
        break;
        
      case 'auth-event':
        // Direct auth event link
        items.push({ label: 'Auth Events', href: '/admin/auth-events' });
        if (entityName) {
          items.push({ label: entityName });
        }
        break;
    }
  }

  return <Breadcrumbs items={items} className={className} />;
}