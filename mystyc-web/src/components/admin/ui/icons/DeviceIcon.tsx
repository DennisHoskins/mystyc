import { MonitorSmartphone, Monitor, Tablet, Smartphone } from 'lucide-react'

import { Device } from 'mystyc-common/schemas/';

export default function DeviceIcon({ device, size = 6 }: { device?: Device | null, size?: number }) {
  if (!device) {
    return <MonitorSmartphone className={`w-${size} h-${size}`} />
  }

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('ipad')) return Tablet;
    if (ua.includes('android') && !ua.includes('mobile')) return Tablet;
    if (ua.includes('tablet')) return Tablet;
    
    if (ua.includes('iphone')) return Smartphone;
    if (ua.includes('android')) return Smartphone;
    if (ua.includes('mobile')) return Smartphone;
    
    return Monitor;
  };

  const DeviceIcon = getDeviceIcon(device.userAgent || '');

  return (
    <DeviceIcon className={`w-${size} h-${size}`} />
  );    
}