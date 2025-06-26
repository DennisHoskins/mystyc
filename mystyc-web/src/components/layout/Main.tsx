'use client';

export default function Main({ children }: { children: React.ReactNode }) {

  return (
    <main className="flex-1 flex flex-col justify-center">
      {children}
    </main>
  );
}


