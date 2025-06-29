'use client';

import { use } from 'react';
import DevicePage from '@/components/app/mystyc/admin/content/devices/device/DevicePage';

interface DevicePageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

export default function Page({ params }: DevicePageProps) {
  const { deviceId } = use(params);

  return <DevicePage deviceId={deviceId} />
}