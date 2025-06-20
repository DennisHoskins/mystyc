'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  ReactNode,
} from 'react';

import { useTransitions } from '@/components/context/TransitionContext';
import Transition, { TransitionRef } from './Transition';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger';

export type StateTransitionRef = TransitionRef;

const StateTransition = forwardRef<
  StateTransitionRef,
  { children: ReactNode; isWebsite: boolean }
>(({ children, isWebsite }, ref) => {
  const { stateTransitionRef } = useTransitions();
  const setStateTransitioning = useAppStore((s) => s.setStateTransitioning);
  const isStateTransitioning = useAppStore((s) => s.isStateTransitioning);
  const transitionRef = useRef<TransitionRef>(null);
  const prevFlag = useRef(isWebsite);
  const [content, setContent] = useState(children);

  useImperativeHandle(ref, () => transitionRef.current!);
  useImperativeHandle(stateTransitionRef, () => transitionRef.current!);

  useEffect(() => {
    if (prevFlag.current === isWebsite) return;
    prevFlag.current = isWebsite;
    setStateTransitioning(true);

    (async () => {
      logger.log('[STATE TRANSITION] out');
      await transitionRef.current!.transitionOut();
    })();
  }, [children, isWebsite, setStateTransitioning]);

  useEffect(() => {
    if (!isStateTransitioning) {
      return;
    }

    logger.log('[STATE TRANSITION] swap');
    setContent(children);

    (async () => {
      await transitionRef.current!.transitionIn();
      logger.log('[STATE TRANSITION] in');
      setStateTransitioning(false);
    })();
  }, [children, isStateTransitioning, setStateTransitioning]);

  return <Transition ref={transitionRef} transition={"transition-state"}>{content}</Transition>;
});

StateTransition.displayName = 'StateTransition';
export default StateTransition;
