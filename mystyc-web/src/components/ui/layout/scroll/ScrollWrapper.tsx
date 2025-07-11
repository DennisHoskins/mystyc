'use client';

import { usePathname } from 'next/navigation';

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');  

 return (
    <div className={`flex flex-col w-full ${styles.scrollWrapper} ${isAdminPath ? styles.admin : ''}`}>
      {children}
    </div>
 );  
}