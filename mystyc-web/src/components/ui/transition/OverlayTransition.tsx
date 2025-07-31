"use client"

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OverlayTransition({ children } : { children: React.ReactNode }) {
  const pathname = usePathname();
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
          key={pathname + '-modal'}
          initial={{ opacity: 0, backdropFilter: "blur(0)" }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0)" }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="absolute h-full w-full flex items-center justify-center z-[80]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}