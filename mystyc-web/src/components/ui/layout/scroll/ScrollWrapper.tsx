'use client'

import { useRef, useLayoutEffect } from 'react';
import styles from './ScrollWrapper.module.css';

export default function ScrollWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handleScrollReset = () => {
      console.log('===========>Scroll reset event received');
      
      // Add a small delay to ensure new content is rendered
      requestAnimationFrame(() => {
        console.log('scrollerRef.current:', scrollerRef.current);
        console.log('scrollTop before:', scrollerRef.current?.scrollTop);
        console.log('scrollHeight:', scrollerRef.current?.scrollHeight);
        console.log('clientHeight:', scrollerRef.current?.clientHeight);
        
        if (scrollerRef.current) {
          scrollerRef.current.scrollTop = 0;
          console.log('scrollTop after:', scrollerRef.current.scrollTop);
        }
      });
    };
    
    window.addEventListener('scroll-reset', handleScrollReset);
    return () => window.removeEventListener('scroll-reset', handleScrollReset);
  }, []);

  return (
    <div className={`flex flex-col w-full ${styles.scrollWrapper} ${className}`}>
      <div 
        ref={scrollerRef}
        className={`flex-1 flex flex-col w-full min-h-0 items-center ${styles.scroller}`}
      >
        {children}
      </div>
    </div>
  );  
}