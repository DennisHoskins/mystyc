import Card from '@/components/ui/Card';
import DeviceInfoPanel from './DeviceInfoPanel';

export default function DeviceInfoCard({ deviceId, className }: { deviceId?: string | null, className?: string }) {
  return (
    <Card className={`min-h-22 ${className}`}>
      <DeviceInfoPanel deviceId={deviceId} />
    </Card>
  );    
}