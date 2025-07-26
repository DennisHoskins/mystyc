export default function MystycLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <div className='w-full max-w-3xl flex-1 flex flex-col items-center'>
        {children}
      </div>
    </>
  );
}
