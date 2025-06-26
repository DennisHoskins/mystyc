'use client';
import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
 return (
   <div className={`flex flex-col w-full ${styles.scrollWrapper}`}>
     {children}
   </div>
 );  
}