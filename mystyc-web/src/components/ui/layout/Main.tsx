import PageTransition from '@/components/ui/layout/transition/PageTransition';

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main
      className='flex flex-col grow w-full min-h-0 items-center overflow-hidden'
      style={{ height: 'calc(100vh - 4em)' }}
    >
      <PageTransition>
        {children}
      </PageTransition>        
    </main>
  );
}