import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Transition, { type TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';

export type StateTransitionRef = TransitionRef;

const StateTransition = forwardRef<StateTransitionRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const [content, setContent] = useState(children);
    const transitionRef = useRef<TransitionRef>(null);
    const isInitialMount = useRef(true);
    const { setStateTransitioning } = useTransitions();

    useImperativeHandle(ref, () => ({
      transitionOut: () => transitionRef.current?.transitionOut() || Promise.resolve(),
      transitionIn: () => transitionRef.current?.transitionIn() || Promise.resolve(),
    }));

    useEffect(() => {
      const doTransition = async () => {
        if (isInitialMount.current) {
          isInitialMount.current = false;
          setContent(children);
          return;
        }

        if (transitionRef.current) {
          setStateTransitioning(true);
          console.log("STATE--------->out")
          await transitionRef.current.transitionOut();
          console.log("STATE<--------swap------->")
          setContent(children);
          console.log("STATE<--------wait------->")
          await new Promise(resolve => setTimeout(resolve, 1000));
          await transitionRef.current.transitionIn();
          console.log("STATE<---------in")
          setStateTransitioning(false);
        }
      };

      doTransition();
    }, [children, setStateTransitioning]);

    return (
      <Transition ref={transitionRef}>
        {content}
      </Transition>
    );
  }
);

StateTransition.displayName = 'StateTransition';

export default StateTransition;