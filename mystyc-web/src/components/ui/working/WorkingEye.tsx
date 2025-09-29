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

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <IconEye size={iconSize} className={` ${isWorking ? "text-white " + styles.eyeWorking : 'text-gray-100'} `} />
    </div>
  );
}