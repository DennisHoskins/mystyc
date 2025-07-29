'use client';

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
 return (
    <div className={`flex-1 flex flex-col w-full h-auto min-h-fit ${styles.scrollWrapper}`}>
      {children}
    </div>
 );  
}