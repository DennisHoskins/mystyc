import { useState, useImperativeHandle, forwardRef, ReactNode } from 'react';
import styles from './Transition.module.css';

export interface StateTransitionRef {
  transition: (newContent: ReactNode) => Promise<void>;
  transitionOut: () => Promise<void>;
  transitionIn: () => Promise<void>;
  transitionWait: () => Promise<void>;
}

const StateTransition = forwardRef<StateTransitionRef, { children: ReactNode }>(
  ({ children }, ref) => {
    const [content, setContent] = useState(children);
    const [isVisible, setIsVisible] = useState(true);

    const transitionOut = async (): Promise<void> => {
      console.log("transitionOut->fade out");
      setIsVisible(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const transitionIn = async (): Promise<void> => {
      console.log("transitionIn->fade in");
      setContent(children);
      setIsVisible(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const transitionWait = async (): Promise<void> => {
      console.log("transitionWait->wait");
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const transition = async (newContent: ReactNode): Promise<void> => {
      await transitionOut();
      
      console.log("transition->swap content");
      setContent(newContent);
      
      await transitionWait();
      
      await transitionIn();
    };

    useImperativeHandle(ref, () => ({
      transition,
      transitionOut,
      transitionIn,
      transitionWait
    }));

    return (
      <div 
        className={styles.transitionWrapper}
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {content}
      </div>
    );
  }
);

StateTransition.displayName = 'StateTransition';

export default StateTransition;