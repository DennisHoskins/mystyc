'use client'

import { useEffect } from "react"; 

import WorkingEye from "../ui/working/WorkingEye";

export default function AuthLayout({ children, isWorking = false } : { children: React.ReactNode, isWorking?: boolean }) {

  useEffect(() => {
    let blocker: HTMLDivElement | null = null;

    if (isWorking) {
      blocker = document.createElement('div');
      blocker.style.position = 'fixed';
      blocker.style.inset = '0';
      blocker.style.zIndex = '9999';
      blocker.style.background = 'transparent';
      blocker.style.cursor = 'wait';
      document.body.appendChild(blocker);
    }

    return () => {
      if (blocker) {
        blocker.remove();
      }
    };
  }, [isWorking]);

  return (
    <div className="w-full min-h-[28em] flex flex-col">
      <WorkingEye scale={1.2} className='py-6' isWorking={isWorking} />
      <div className={`${isWorking ? "opacity-50 pointer-events-none" : ""}`}>
        {children}
      </div>
    </div>      
  );
}