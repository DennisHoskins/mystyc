import { useState, useImperativeHandle, forwardRef, ReactNode } from 'react';
import styles from './Transition.module.css';

export interface TransitionRef {
  transitionOut: () => Promise<void>;
  transitionIn: () => Promise<void>;
}

const Transition = forwardRef<TransitionRef, { children: ReactNode }>(
  ({ children }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    const transitionOut = async (): Promise<void> => {
      console.log("transitionOut->fade out");
      setIsVisible(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const transitionIn = async (): Promise<void> => {
      console.log("transitionIn->fade in");
      setIsVisible(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    useImperativeHandle(ref, () => ({
      transitionOut,
      transitionIn
    }));

    return (
      <div 
        className={styles.transitionWrapper}
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {children}
      </div>
    );
  }
);

Transition.displayName = 'Transition';

export default Transition;