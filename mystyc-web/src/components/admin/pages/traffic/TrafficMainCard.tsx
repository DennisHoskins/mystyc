import { TrafficStats } from '@/interfaces/admin/stats';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficMainCard({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className="flex flex-col space-y-4">
      <Card className='min-h-[20em]'>
        <Heading level={4} className="mb-4 text-blue-900">Day Of Week</Heading>
        <div className='grid grid-cols-3 gap-4'>
          <div className="flex flex-col justify-center space-y-3">
            {trafficStats && trafficStats.dayOfWeekVisits
              .sort((a, b) => b.count - a.count)
              .slice(0, 4)
              .map((day, index) => (
              <div key={day.name} className="flex justify-between items-center bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 rounded-lg p-3">
                <div>
                  <Text className="font-medium text-rose-900">
                    {day.name.charAt(0).toUpperCase() + day.name.slice(1)}
                  </Text>
                  <Text variant="small" className="text-rose-700">
                    #{index + 1} most active
                  </Text>
                </div>
                <Text className="text-xl font-bold text-rose-900">
                  {day.count.toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
          
          <div className='col-span-2 flex'>
            <TrafficDashboard 
              data={trafficStats} 
              charts={['dayofweek']}
              layout={'vertical'}
              label={false}
            />
          </div>
        </div>
      </Card>

      <Card className='min-h-[20em]'>
        <Heading level={4} className="mb-4 text-blue-900">Peak Hours (Top 12)</Heading>
        <div className='grid grid-cols-3 gap-4'>
          <div className="flex flex-col justify-center space-y-3">
            {trafficStats && trafficStats.hourlyVisits
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((hour, index) => (
              <div key={hour.hour} className="flex justify-between items-center bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 rounded-lg p-3">
                <div>
                  <Text className="font-medium text-rose-900">
                    {hour.hour}:00
                  </Text>
                  <Text variant="small" className="text-rose-700">
                    #{index + 1} peak hour
                  </Text>
                </div>
                <Text className="text-xl font-bold text-rose-900">
                  {hour.count.toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
          
          <div className='col-span-2 flex'>
            <TrafficDashboard 
              data={trafficStats} 
              charts={['hourly']}
              layout={'vertical'}
              label={false}
          />
          </div>
        </div>
      </Card>
    </div>
  );
}