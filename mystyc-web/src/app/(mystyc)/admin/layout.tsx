import type { Metadata } from 'next';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col w-full min-h-0 px-4 py-4'>
      {children}
    </div>
  );
}
