'use client';

import { 
  ReactNode, 
  useState, 
  useRef, 
  useImperativeHandle, 
  forwardRef 
} from 'react';

import { logger } from '@/util/logger';

import styles from './Transition.module.css';

export interface TransitionRef {
  transitionOut: () => Promise<void>;
  transitionIn: () => Promise<void>;
}

const Transition = forwardRef<TransitionRef, { children: ReactNode, transition: string }>(
  ({ children, transition }, ref) => {
    const [transitionName, setTransitionName] = useState('');
    const transitionRef = useRef<HTMLDivElement>(null);

    const transitionOut = async (): Promise<void> => {
      logger.log("[TRANSITION]: transitionOut->fade out");
      setTransitionName(`${transition}-out`);

      await new Promise<void>(resolve => {      
        const node = transitionRef.current;
        if (!node) return resolve();
        const onEnd = () => {
          node.removeEventListener('animationend', onEnd);
          logger.log("[TRANSITION]: transitionOut->fade out complete");
          resolve();
        };
        node.addEventListener('animationend', onEnd);
      });
    };

    const transitionIn = async (): Promise<void> => {
      logger.log("[TRANSITION]: transitionIn->fade in");
      setTransitionName(`${transition}-in`);

      await new Promise<void>(resolve => {      
        const node = transitionRef.current;
        if (!node) {
          logger.error("[TRANSITION]: transitionIn->fade in failed, node is null");
          return resolve();
        }
        const onEnd = () => {
          node.removeEventListener('animationend', onEnd);
          logger.log("[TRANSITION]: transitionIn->fade in complete");
          resolve();
        };
        node.addEventListener('animationend', onEnd);
      });
    };

    useImperativeHandle(ref, () => ({
      transitionOut,
      transitionIn
    }));

    return (
      <div 
        ref={transitionRef}
        className={`flex-1 flex flex-col w-full min-h-0 ${styles.transitionWrapper} ${styles[transitionName]}`}
      >
        {children}
      </div>
    );
  }
);

Transition.displayName = 'Transition';
export default Transition;