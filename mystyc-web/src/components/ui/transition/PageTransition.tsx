"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition({ children } : { children: React.ReactNode }) {
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    const handleStartExit = () => setShowing(false);
    window.addEventListener('start-exit', handleStartExit);
    return () => window.removeEventListener('start-exit', handleStartExit);
  }, []);

  return (
    <AnimatePresence onExitComplete={ () => window.dispatchEvent(new CustomEvent('exit-complete')) } >
      {showing && (
        <motion.div
          key="mystyc"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex flex-col w-full items-center justify-center"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}