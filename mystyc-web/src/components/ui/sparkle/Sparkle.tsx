'use client'

import React, { useState, useEffect } from 'react';

import styles from './Sparkle.module.css';
import { AppUser } from '@/interfaces/app/app-user.interface';

export default function Sparkle({ user } : { user?: AppUser | null }) {
  const [prevIsPlus, setPrevIsPlus] = useState(user?.isPlus);
  const [animationType, setAnimationType] = useState<string>("");
  const isPlus = user?.isPlus;

  useEffect(() => {
    if (prevIsPlus !== isPlus) {
      if (prevIsPlus === undefined && isPlus === true) {
        setAnimationType('login-plus');
      } else if (prevIsPlus === false && isPlus === true) {
        setAnimationType('upgrade');
      } else if (prevIsPlus === true && (isPlus === false || isPlus === undefined)) {
        setAnimationType('downgrade');
      }
      setPrevIsPlus(isPlus);
    }
  }, [isPlus, prevIsPlus]);

  const getClassName = () => {
    if (!animationType) return isPlus ? styles.plus : '';
    switch (animationType) {
      case 'login-plus':
        return styles.loginPlus;
      case 'upgrade':
        return styles.upgrade;
      case 'downgrade':
        return styles.downgrade;
      default:
        return isPlus ? styles.plus : '';
    }
  };

  return <sup className={`opacity-0 w-6 h-6 -ml-2 mt-1 flex items-center justify-center leading-none text-lg font-mono ${getClassName()}`}>+</sup>;
}