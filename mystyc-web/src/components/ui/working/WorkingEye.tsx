'use client'

import styles from './Working.module.css';
import IconEye from '@/components/ui/icons/IconEye';

type WorkingEyeProps = {
  scale?: number;
  className?: string;
  isWorking?: boolean
};

export default function WorkingEye({
  scale = 1,
  className = '',
  isWorking = false
}: WorkingEyeProps) {
  const iconSize = 50 * scale;
  const titleSize = `${1.25 * scale}rem`; // roughly 20px base scaled

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <IconEye size={iconSize} className={` ${isWorking ? "text-gray-900 " + styles.eyeWorking : 'text-gray-500'} `} />
      <div style={{ fontSize: titleSize }} className={`font-bold tracking-wide ${isWorking ? "text-gray-300" : "text-gray-500"} flex items-center`}>
        mystyc
      </div>
    </div>
  );
}