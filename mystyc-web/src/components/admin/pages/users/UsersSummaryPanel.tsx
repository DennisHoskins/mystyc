import { UsersSummary } from 'mystyc-common/admin/interfaces/summary';
import { UserView } from './UsersPage'; 
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface UsersSummaryPanelProps {
  summary: UsersSummary | null,
  handleClick: (view: UserView) => void;
  currentView?: UserView;
}

export default function UsersSummaryPanel({ summary, handleClick, currentView }: UsersSummaryPanelProps) {
  return (
    <AdminDetailGrid>
      <AdminDetailField
        label="Conversion Rate"
        value={(() => {
          if (!summary) return null;

          const total = summary?.total || 0;
          const plus = summary?.plus || 0;
          
          if (total === 0) return "0%";
          
          const percentage = (plus / total * 100).toFixed(1);
          return `${percentage}%`;
        })()}
        href='/admin/users/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="Total Users"
        value={summary ? (summary.total || "0") : ""}
        href={summary?.total ? `/admin/users?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
      <AdminDetailField
        label="Free Users"
        value={summary ? (summary.users || "0") : ""}
        href={summary?.users ? `/admin/users?users` : null}
        onClick={() => handleClick("users")}
        active={currentView == "users"}
      />
      <AdminDetailField
        label="Plus Users"
        value={summary ? (summary.plus || "0") : ""}
        href={summary?.plus ? `/admin/users?plus` : null}
        onClick={() => handleClick("plus")}
        active={currentView == "plus"}
      />
    </AdminDetailGrid>
  );
}
