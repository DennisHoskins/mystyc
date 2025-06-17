import { useState, useImperativeHandle, forwardRef, ReactNode } from 'react';
import styles from './Transition.module.css';

export interface TransitionRef {
 transition: (newContent: ReactNode) => Promise<void>;
}

const Transition = forwardRef<TransitionRef, { children: ReactNode }>(
 ({ children }, ref) => {
   const [content, setContent] = useState(children);
   const [isVisible, setIsVisible] = useState(true);

   const transition = async (newContent: ReactNode): Promise<void> => {

console.log("transition->fade out")

     // Hide current content
     setIsVisible(false);
     await new Promise(resolve => setTimeout(resolve, 1000));

console.log("transition->swap content")

     // Replace content
     setContent(newContent);

console.log("transition->wait")
     
     // Wait 1 second
     await new Promise(resolve => setTimeout(resolve, 1000));
     
console.log("transition->fade in")
     
     // Show new content
     setIsVisible(true);
     await new Promise(resolve => setTimeout(resolve, 1000));
   };

   useImperativeHandle(ref, () => ({
     transition
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

Transition.displayName = 'Transition';

export default Transition;