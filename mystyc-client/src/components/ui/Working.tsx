'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/util/logger';

import IconEye from '@/components/icons/IconEye';

interface WorkingProps {
  show: boolean;
  delayMs?: number;
}

export default function Working({ show, delayMs = 0 }: WorkingProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  logger.log('[Working] render - show:', show, 'delayMs:', delayMs, 'visible:', visible, 'fadeOut:', fadeOut);

  useEffect(() => {
    logger.log('[Working] useEffect triggered - show:', show, 'delayMs:', delayMs, 'visible:', visible);
    let delayTimeout: NodeJS.Timeout;

    if (show) {
      if (delayMs > 0) {
        logger.log('[Working] setting timeout for', delayMs, 'ms');
        delayTimeout = setTimeout(() => {
          logger.log('[Working] timeout fired, setting visible=true');
          setVisible(true);
          setFadeOut(false);
        }, delayMs);
      } else {
        logger.log('[Working] setting visible=true immediately');
        setVisible(true);
        setFadeOut(false);
      }
    } else if (visible) {
      logger.log('[Working] starting fade out');
      setFadeOut(true);
      delayTimeout = setTimeout(() => {
        logger.log('[Working] fade out complete, setting visible=false');
        setVisible(false);
      }, 300);
    }

    return () => {
      logger.log('[Working] useEffect cleanup');
      clearTimeout(delayTimeout);
    };
  }, [show, delayMs, visible]);

  logger.log('[Working] about to render - visible:', visible);
  if (!visible) {
    logger.log('[Working] returning null');
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/0.25 backdrop-blur-sm ${
        fadeOut ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div className="animate-ping-soft text-black drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
        <IconEye className="w-20 h-20" />
      </div>
    </div>
  );
}