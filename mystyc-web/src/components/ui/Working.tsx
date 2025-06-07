'use client';

import { useEffect, useState } from 'react';

import IconEye from '@/components/icons/IconEye';

interface WorkingProps {
  show: boolean;
  delayMs?: number;
}

export default function Working({ show, delayMs = 0 }: WorkingProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let delayTimeout: NodeJS.Timeout;

    if (show) {
      if (delayMs > 0) {
        delayTimeout = setTimeout(() => {
          setVisible(true);
          setFadeOut(false);
        }, delayMs);
      } else {
        setVisible(true);
        setFadeOut(false);
      }
    } else if (visible) {
      setFadeOut(true);
      delayTimeout = setTimeout(() => {
        setVisible(false);
      }, 300);
    }

    return () => {
      clearTimeout(delayTimeout);
    };
  }, [show, delayMs, visible]);

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