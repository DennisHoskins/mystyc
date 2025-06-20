'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  ReactNode,
} from 'react';
import Transition, { TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';
import { useAppStore } from '@/store/appStore';

export type StateTransitionRef = TransitionRef;

const StateTransition = forwardRef<
  StateTransitionRef,
  { children: ReactNode; isWebsite: boolean }
>(({ children, isWebsite }, ref) => {
  const { stateTransitionRef } = useTransitions();
  const setStateTransitioning = useAppStore((s) => s.setStateTransitioning);

  const [content, setContent] = useState(children);
  const transitionRef = useRef<TransitionRef>(null);
  const prevFlag = useRef(isWebsite);

  useImperativeHandle(ref, () => transitionRef.current!);
  useImperativeHandle(stateTransitionRef, () => transitionRef.current!);

  useEffect(() => {
    setContent(children);
  }, [children]);

  useEffect(() => {
    if (prevFlag.current === isWebsite) return;
    prevFlag.current = isWebsite;

    (async () => {

console.log('');
console.log('STATE out');

      setStateTransitioning(true);
      await transitionRef.current!.transitionOut();

console.log('STATE swap');

// console.log('STATE wait 250ms');
//       await new Promise((r) => setTimeout(r, 250));

      await transitionRef.current!.transitionIn();

  console.log('STATE in');
  console.log('');
  
      setStateTransitioning(false);
    })();
  }, [children, isWebsite, setStateTransitioning]);

  return <Transition ref={transitionRef}>{content}</Transition>;
});

StateTransition.displayName = 'StateTransition';
export default StateTransition;
