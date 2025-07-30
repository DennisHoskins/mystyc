'use client'

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
 return (
    <div className={`flex flex-col w-full h-[var(--client-height)]`}>
      <div className={`flex-1 flex flex-col w-full min-h-0 ${styles.scroller}`}>
        {children}
      </div>
    </div>
  );  
}