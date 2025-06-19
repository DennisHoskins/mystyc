import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Transition, { type TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';

export type PageTransitionRef = TransitionRef;

const PageTransition = forwardRef<PageTransitionRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const [content, setContent] = useState(children);
    const transitionRef = useRef<TransitionRef>(null);
    const { isStateTransitioning } = useTransitions();

    useImperativeHandle(ref, () => ({
      transitionOut: () => {
        if (isStateTransitioning) {
          console.log("PageTransition: State is transitioning, skipping out");
          return Promise.resolve();
        }
        console.log("PageTransition: transitioning out");
        return transitionRef.current?.transitionOut() || Promise.resolve();
      },
      transitionIn: () => {
        if (isStateTransitioning) {
          console.log("PageTransition: State is transitioning, skipping in");
          return Promise.resolve();
        }
        console.log("PageTransition: transitioning in");
        return transitionRef.current?.transitionIn() || Promise.resolve();
      },
    }));

    useEffect(() => {
      console.log("PageTransition: children changed");
      setContent(children);
      if (!isStateTransitioning) {
        transitionRef.current?.transitionIn();
      } else {
        console.log("PageTransition: State is transitioning, skipping auto transition in");
      }
    }, [children, isStateTransitioning]);

    return (
      <Transition ref={transitionRef}>
        {content}
      </Transition>
    );
  }
);

PageTransition.displayName = 'PageTransition';

export default PageTransition;