"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children } : { children: React.ReactNode }) {
  const [showing, setShowing] = useState(true);
  const pathname = usePathname();

   useEffect(() => {
    setShowing(true);
  }, [pathname]);

  useEffect(() => {
    const handleStartExit = () => setShowing(false);
    window.addEventListener('start-exit', handleStartExit);
    return () => window.removeEventListener('start-exit', handleStartExit);
  }, []);

  return (
    <AnimatePresence onExitComplete={ () => window.dispatchEvent(new CustomEvent('exit-complete')) } >
      {showing && (
        <motion.div
          key={pathname} // Dynamic key based on current route
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex flex-col w-full min-h-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}