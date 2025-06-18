'use client';

import PageTransition from '@/components/transition/StateTransition';

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </PageTransition>      
  );
}


