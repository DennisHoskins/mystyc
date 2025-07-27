import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import Card from "@/components/ui/Card";
import AuthenticationDashboard from "./AuthenticationDashboard";

export default function AuthenticationsDashboardGrid({
  stats
} : {
  stats: AuthEventStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <AuthenticationDashboard
          key={'peak'}
          stats={stats} 
          charts={['peak']}
        />
      </Card>
      <Card>
        <AuthenticationDashboard 
          key={'events'}
          stats={stats} 
          charts={['events']}
        />
      </Card>        
    </div>
  );
}