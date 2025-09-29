import { Device } from 'mystyc-common/schemas';
import AdminCard from '../../ui/AdminCard';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';

export default function DevicesCard({ devices, total, href }: { devices: Device[], total: number | null, href: string }) {
  return (
    <AdminCard
      icon={<DevicesIcon />}
      title='Devices'
      href={href}
    >
      <>
        {total &&
          <div className='flex flex-col space-y-2'>
            {devices.map((device) => (
              <Link 
                key={device.deviceId} 
                href={`/admin/devices/${device.deviceId}`}
                className="flex !flex-row items-center space-x-4"
              >
                <Panel padding={4} className='overflow-hidden'>
                  <Heading level={6}>{device.deviceName ? device.deviceName.split(" (")[0] : "Unknown Device"}</Heading>
                  <Text variant='xs'>{device.deviceId}</Text>
                </Panel>
              </Link>
            ))}
          </div>        
        }
      </>
    </AdminCard>
  );
}