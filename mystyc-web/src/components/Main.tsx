'use client';

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {children}
    </main>
  );
}


