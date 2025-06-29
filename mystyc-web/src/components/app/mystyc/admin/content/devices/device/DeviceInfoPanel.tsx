'use client';

import { Device } from '@/interfaces';

export default function DeviceInfoPanel({ device }: { device?: Device | null }) {
  if (!device) {
    return null;
  }

  return (
    <>
    </>
  );
}