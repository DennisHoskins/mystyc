'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import IconEye from '@/components/icons/IconEye';
import fade from '@/styles/Fade.module.css';
import styles from './Working.module.css';

export default function Working() {
  const isBusy = useAppStore((state) => state.isBusy);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isBusy) {
      setVisible(true);
      setFadingOut(false);
    } else if (visible) {
      setFadingOut(true);
      timeout = setTimeout(() => setVisible(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [isBusy, visible]);

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${fadingOut ? fade.fadeOut : fade.fadeIn}`}>
      <IconEye className={`${styles.icon} animate-ping-soft w-20 h-20`} />
    </div>
  );
}
