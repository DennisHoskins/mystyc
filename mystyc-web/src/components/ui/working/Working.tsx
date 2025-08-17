'use client'

import { useEffect, useState } from 'react';

import styles from './Working.module.css';

import { useAppStore } from '@/store/appStore';

import Overlay from '@/components/ui/overlay/Overlay';
import IconEye from '@/components/ui/icons/IconEye';

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
    <Overlay className={`${fadingOut ? styles.fadeOut : styles.fadeIn}`}>
      <IconEye className={`${styles.icon} ${styles.animatePingSoft} w-20 h-20`} />
    </Overlay>
  );
}