import { TrafficStats } from '@/interfaces/admin/stats';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficMainCard({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <Card className="grid grid-cols-2 gap-4 flex-1 min-h-0 !space-y-0">
      <div className='grow min-h-0 bg-gray-100 rounded-md p-2 pb-0 flex'>
        <div className='flex-1 flex w-full grow'>
          <div className='grid grid-cols-3 gap-4 w-full min-h-0 grow'>

            <div className="flex flex-col justify-start space-y-2">
              <Heading level={4} className="text-blue-900">Day Of Week</Heading>

              {trafficStats && trafficStats.dayOfWeekVisits
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((day, index) => (
                <div key={day.name} className="flex justify-between items-center bg-white border-indigo-200 rounded-lg px-2 py-1">
                  <div>
                    <Text className="font-bold text-rose-900 !text-[10px]">
                      {day.name.charAt(0).toUpperCase() + day.name.slice(1)}
                    </Text>
                    <Text className="text-rose-700 !text-[10px]">
                      #{index + 1} most active
                    </Text>
                  </div>
                  <Text className="text-xl font-bold text-rose-900">
                    {day.count.toLocaleString()}
                  </Text>
                </div>
              ))}
            </div>
            
            <div className='col-span-2 flex grow min-h-0 max-h-[15em]'>
              <TrafficDashboard 
                data={trafficStats} 
                charts={['dayofweek']}
                layout={'vertical'}
                label={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='grow min-h-0 bg-gray-100 rounded-md p-2 flex'>
        <div className='flex-1 flex w-full min-h-0'>
          <div className='grid grid-cols-3 gap-4 w-full min-h-0 grow'>

            <div className="flex flex-col justify-start space-y-2">
              <Heading level={4} className="text-blue-900">Peak Hours (Top 5)</Heading>
              {trafficStats && trafficStats.hourlyVisits
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((hour, index) => (
                <div key={hour.hour} className="flex justify-between items-center bg-white border-indigo-200 rounded-lg px-2 py-1">
                  <div>
                    <Text className="font-bold text-rose-900 !text-[10px]">
                      {hour.hour}:00
                    </Text>
                    <Text className="text-rose-700 !text-[10px]">
                      #{index + 1} peak hour
                    </Text>
                  </div>
                  <Text className="text-xl font-bold text-rose-900">
                    {hour.count.toLocaleString()}
                  </Text>
                </div>
              ))}
            </div>
            
            <div className='col-span-2 flex grow min-h-0 max-h-[15em]'>
              <TrafficDashboard 
                data={trafficStats} 
                charts={['hourly']}
                layout={'vertical'}
                label={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}