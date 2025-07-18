'use client';

export default function MystycLayout({ children}: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center">
      <div className='w-full max-w-content text-center mt-4'>
        {children}
      </div>
    </div>
  );
}