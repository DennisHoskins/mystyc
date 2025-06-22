'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

import { useUser } from '@/components/context/AppContext';
import Transition, { TransitionRef } from './Transition';
import { logger } from '@/util/logger';

export default function StateTransition({ children }: { children: ReactNode; }) {
  const user = useUser();
  const transitionRef = useRef<TransitionRef>(null);
  const [currentChildren, setCurrentChildren] = useState(children);
  const isFirstRender = useRef(true);
  const isWebsite = !user;
  const [displayedIsWebsite, setDisplayedIsWebsite] = useState(isWebsite);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isWebsite == displayedIsWebsite) {
      return;
    }

    const doTransition = async () => {
      logger.log('[STATE TRANSITION] isWebsite changed, fading out');
      await transitionRef.current?.transitionOut();
      
      setDisplayedIsWebsite(isWebsite);
      setCurrentChildren(children);
      
      logger.log('[STATE TRANSITION] fading in new content');
      await transitionRef.current?.transitionIn();
    };
    doTransition();
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