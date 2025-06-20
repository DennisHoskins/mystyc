import {
  useRef,
  forwardRef,
  useImperativeHandle,
  ReactNode
} from 'react';
import Transition, { TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';

export type PageTransitionRef = TransitionRef;

const PageTransition = forwardRef<
  PageTransitionRef,
  { children: ReactNode }
>(({ children }, ref) => {
  const { pageTransitionRef } = useTransitions();
  const transitionRef = useRef<TransitionRef>(null);

  useImperativeHandle(ref, () => transitionRef.current!);
  useImperativeHandle(pageTransitionRef, () => transitionRef.current!);

  return <Transition ref={transitionRef}>{children}</Transition>;
});

PageTransition.displayName = 'PageTransition';
export default PageTransition;
