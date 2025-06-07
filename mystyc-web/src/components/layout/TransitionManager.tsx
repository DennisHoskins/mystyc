'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/components/context/TransitionContext';
import { useBusy } from '@/components/context/BusyContext';
import { logger } from '@/util/logger';

interface Props {
 children: React.ReactNode;
}

export default function TransitionManager({ children }: Props) {
 const [isVisible, setIsVisible] = useState(true);
 const { setBusy } = useBusy();
 const pathname = usePathname();
 const transition = useTransition();
 const currentPath = useRef(pathname);
 const waitingForRouteChange = useRef(false);

 // Listen for transition requests
 useEffect(() => {
   if (transition.isTransitionRequested) {
     logger.log('[TransitionManager] Starting transition');
     setBusy(true);
     setIsVisible(false);
     waitingForRouteChange.current = true;

     setTimeout(() => {
       transition.callTransitionOutCallback();
     }, 150);
   }
 }, [transition.isTransitionRequested, setBusy, transition]);

 // Update currentPath when pathname changes
 useEffect(() => {
   const previousPath = currentPath.current;
   currentPath.current = pathname;

   // If we were waiting for a route change and it happened, start fade-in
   if (waitingForRouteChange.current && pathname !== previousPath) {
     if (pathname === '/') {
       logger.log('[TransitionManager] Route change to root, skipping fade');
       waitingForRouteChange.current = false;
       setIsVisible(true);
       setBusy(false);
       transition.callTransitionCompleteCallback();
       return;
     }

     logger.log('[TransitionManager] Route changed, fading in');
     waitingForRouteChange.current = false;
     setIsVisible(true);

     setTimeout(() => {
       setBusy(false);
       transition.callTransitionCompleteCallback();
     }, 150);
   }
 }, [pathname, transition, setBusy]);

 return (
    <div className={`flex flex-1 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}>
      {children}
    </div>
 );
}