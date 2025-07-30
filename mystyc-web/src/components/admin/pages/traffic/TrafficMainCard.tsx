import { TrafficStats } from '@/interfaces/admin/stats';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficMainCard({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
      <Card className='grow min-h-0'>
        <Heading level={3} className="mb-4 text-blue-900">Day Of Week</Heading>
        <div className='flex-1 flex w-full min-h-0'>
          <div className='grid grid-cols-3 gap-4 w-full min-h-0'>

            <div className="flex flex-col justify-start space-y-3">
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
            
            <div className='col-span-2 flex grow min-h-0'>
              <TrafficDashboard 
                data={trafficStats} 
                charts={['dayofweek']}
                layout={'vertical'}
                label={false}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className='min-h-0'>
        <Heading level={3} className="mb-4 text-blue-900">Peak Hours (Top 6)</Heading>
        <div className='flex-1 flex w-full min-h-0'>
          <div className='grid grid-cols-3 gap-4 w-full min-h-0'>

            <div className="flex flex-col justify-start space-y-3">
              {trafficStats && trafficStats.hourlyVisits
                .sort((a, b) => b.count - a.count)
                .slice(0, 4)
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
            
            <div className='col-span-2 flex grow min-h-0'>
              <TrafficDashboard 
                data={trafficStats} 
                charts={['hourly']}
                layout={'vertical'}
                label={false}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}