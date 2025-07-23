import { usePathname } from 'next/navigation';

import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');  

 return (
    <div className={`flex-1 flex flex-col w-full h-fit ${styles.scrollWrapper} ${isAdminPath ? styles.admin : ''}`}>
      {children}
    </div>
 );  
}