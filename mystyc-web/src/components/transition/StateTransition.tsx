'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import Transition, { TransitionRef } from './Transition';
import { logger } from '@/util/logger';

export default function StateTransition({ 
  children, 
  isWebsite 
}: { 
  children: ReactNode; 
  isWebsite: boolean;
}) {
  const transitionRef = useRef<TransitionRef>(null);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [displayedIsWebsite, setDisplayedIsWebsite] = useState(isWebsite);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isWebsite !== displayedIsWebsite) {
      const doTransition = async () => {
        logger.log('[STATE TRANSITION] isWebsite changed, fading out');
        await transitionRef.current?.transitionOut();
        
        setDisplayedIsWebsite(isWebsite);
        setCurrentChildren(children);

        // fake a short delay so it feels like work
        await new Promise(resolve => setTimeout(resolve, 250));
        
        logger.log('[STATE TRANSITION] fading in new content');
        await transitionRef.current?.transitionIn();
      };
      doTransition();
    }
  }, [isWebsite, displayedIsWebsite, children]);

  useEffect(() => {
    if (isWebsite === displayedIsWebsite) {
      setCurrentChildren(children);
    }
  }, [children, isWebsite, displayedIsWebsite]);

  return (
    <Transition ref={transitionRef} transition="transition-state">
      {currentChildren}
    </Transition>
  );
}