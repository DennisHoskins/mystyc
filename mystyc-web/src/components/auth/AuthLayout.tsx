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
    <div className="w-full min-h-[28em] flex flex-col items-center">
      <WorkingEye scale={1.75} className='py-2' isWorking={isWorking} />
      <div className={`w-full flex flex-col items-center ${isWorking ? "opacity-50 pointer-events-none" : ""}`}>
        <div className={`text-2xl font-bold tracking-wide text-white flex items-center pb-0`}>
          mystyc
        </div>
        {children}
      </div>
    </div>      
  );
}