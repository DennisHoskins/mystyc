'use client'

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
 return (
    <div className={`flex flex-col w-full ${styles.scrollWrapper} ${className}`}>
      <div className={`flex-1 flex flex-col w-full min-h-0 items-center ${styles.scroller}`}>
        {children}
      </div>
    </div>
  );  
}