'use client';

import { AuthEventsSummary } from 'mystyc-common/admin/interfaces/summary';

import { AuthenticationView } from './AuthenticationsPage'; 
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface AuthenticationsSummaryPanelProps {
  summary: AuthEventsSummary | null,
  handleClick: (view: AuthenticationView) => void;
  currentView?: AuthenticationView;
}

export default function AuthenticationsSummaryPanel({ summary, handleClick, currentView }: AuthenticationsSummaryPanelProps) {
  return (
    <AdminDetailGroup cols={6}>
      <AdminDetailField
        label="Success Rate"
        value={(() => {
          if (!summary) return null;

          const total = summary?.total || 0;
          const successful = (summary?.create || 0) + (summary?.login || 0) + (summary?.logout || 0);
          
          if (total === 0) return "0%";
          
          const percentage = (successful / total * 100).toFixed(1);
          return `${percentage}%`;
        })()}
        href='/admin/authentication/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="All Events"
        value={summary ? (summary.total || "0") : ""}
        href={summary?.total ? `/admin/authentication?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
      <AdminDetailField
        label="Create Events"
        value={summary ? (summary.create || "0") : ""}
        href={summary?.create ? `/admin/authentication?create` : null}
        onClick={() => handleClick("create")}
        active={currentView == "create"}
      />
      <AdminDetailField
        label="Login Events"
        value={summary ? (summary.login || "0") : ""}
        href={summary?.login ? `/admin/authentication?login` : null}
        onClick={() => handleClick("login")}
        active={currentView == "login"}
      />
      <AdminDetailField
        label="Logout Events"
        value={summary ? (summary.logout || "0") : ""}
        href={summary?.logout ? `/admin/authentication?logout` : null}
        onClick={() => handleClick("logout")}
        active={currentView == "logout"}
      />
      <AdminDetailField
        label="Server Logout Events"
        value={summary ? (summary.serverLogout || "0") : ""}
        href={summary?.serverLogout ? `/admin/authentication?server-logout` : null}
        onClick={() => handleClick("server-logout")}
        active={currentView == "server-logout"}
      />
    </AdminDetailGroup>
  );
}