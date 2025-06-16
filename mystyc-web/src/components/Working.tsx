'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import IconEye from '@/components/icons/IconEye';

export default function Working() {
  const isBusy = useAppStore((state) => state.isBusy);
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let fadeTimeout: NodeJS.Timeout;

    if (isBusy) {
      setVisible(true);
      setFadeOut(false);
    } else if (visible) {
      setFadeOut(true);
      fadeTimeout = setTimeout(() => {
        setVisible(false);
      }, 300);
    }

    return () => {
      clearTimeout(fadeTimeout);
    };
  }, [isBusy, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/0.25 backdrop-blur-sm ${
        fadeOut ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div className="text-black drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
        <IconEye className="animate-ping-soft w-20 h-20" />
      </div>
    </div>
  );
}