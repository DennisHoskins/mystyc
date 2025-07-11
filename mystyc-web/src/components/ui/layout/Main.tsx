'use client';

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className='main flex-1 flex flex-col min-h-0'>
      {children}
    </main>
  );
}


