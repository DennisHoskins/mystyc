'use client';

import { usePathname } from 'next/navigation';

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

 return (
    <div className={`flex-1 flex flex-col w-full h-fit ${styles.scrollWrapper}`}>
      {children}
    </div>
 );  
}