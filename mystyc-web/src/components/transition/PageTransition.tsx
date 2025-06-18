import styles from './Transition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const isVisible = true;

  return (
    <div 
      className={styles.transitionWrapper}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
