'use client'

import { ContentsSummary } from 'mystyc-common/admin/interfaces/summary';
import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import { ContentView } from './ContentsPage'; 
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface ContentsSummaryPanelProps {
  summary: ContentsSummary | null,
  stats: ContentStats | null,
  handleClick: (view: ContentView) => void;
  currentView?: ContentView;
}

export default function ContentsSummaryPanel({ summary, stats, handleClick, currentView }: ContentsSummaryPanelProps) {
  return (
    <AdminDetailGrid cols={6}>
      <AdminDetailField
        label="Success Rate"
        value={(() => {
          if (!stats?.summary?.successRate) return null;
          
          return `${stats.summary.successRate}%`;
        })()}
        href='/admin/content/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="All Content"
        value={summary ? (summary.total || "0") : ""}
        href={summary?.total ? `/admin/content?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
      <AdminDetailField
        label="Notifications"
        value={summary ? (summary.notifications || "0") : ""}
        href={summary?.notifications ? `/admin/content?notifications` : null}
        onClick={() => handleClick("notifications")}
        active={currentView == "notifications"}
      />
      <AdminDetailField
        label="Website"
        value={summary ? (summary.website || "0") : ""}
        href={summary?.website ? `/admin/content?website` : null}
        onClick={() => handleClick("website")}
        active={currentView == "website"}
      />
      <AdminDetailField
        label="Users"
        value={summary ? (summary.users || "0") : ""}
        href={summary?.users ? `/admin/content?users` : null}
        onClick={() => handleClick("users")}
        active={currentView == "users"}
      />
      <AdminDetailField
        label="Users Plus"
        value={summary ? (summary.plus || "0") : ""}
        href={summary?.plus ? `/admin/content?users-plus` : null}
        onClick={() => handleClick("users-plus")}
        active={currentView == "users-plus"}
      />
    </AdminDetailGrid>
  );
}