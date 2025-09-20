import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import AuthenticationDashboard from "./AuthenticationDashboard";

export default function AuthenticationsDashboardGrid({
  stats
} : {
  stats: AuthEventStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex flex-col pb-2'>
        <AuthenticationDashboard
          key={'peak'}
          stats={stats} 
          charts={['duration']}
        />
      </div>
      <div className='flex flex-col pb-2'>
        <AuthenticationDashboard 
          key={'events'}
          stats={stats} 
          charts={['events']}
        />
      </div>
    </div>
  );
}