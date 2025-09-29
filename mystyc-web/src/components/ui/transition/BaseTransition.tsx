"use client"

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface TransitionProps {
  children: React.ReactNode;
  variants: Variants;
  transitionConfig?: any;
  className?: string;
  keyPrefix?: string;
  usePathnameKey?: boolean;
  doTransition?: boolean;
}

// Preset variants
export const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  fadeScale: {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 }
  },
  fadeSlide: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  fadeBlur: {
    initial: { opacity: 0, backdropFilter: "blur(0)" },
    animate: { opacity: 1, backdropFilter: "blur(10px)" },
    exit: { opacity: 0, backdropFilter: "blur(0)" }
  }
};

export default function BaseTransition({ 
  children, 
  variants,
  transitionConfig = { duration: 0.25, ease: "easeInOut" },
  className = "",
  keyPrefix = "transition",
  usePathnameKey = false,
  doTransition = true,
}: TransitionProps) {
  const [showing, setShowing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setShowing(true);
  }, [keyPrefix, pathname, usePathnameKey]);

  useEffect(() => {
    const handleStartExit = () => setShowing(false);
    window.addEventListener('start-exit', handleStartExit);
    return () => window.removeEventListener('start-exit', handleStartExit);
  }, []);

  const key = usePathnameKey ? `${pathname}-${keyPrefix}` : keyPrefix;

  return (
    <AnimatePresence onExitComplete={() => { window.dispatchEvent(new CustomEvent('exit-complete')); }}>
      {showing && (
        <motion.div
          key={key}
          variants={variants}
          initial={doTransition ? 'initial' : ''}
          animate="animate"
          exit="exit"
          transition={transitionConfig}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}