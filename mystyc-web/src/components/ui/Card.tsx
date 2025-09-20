export default function Card({ 
  children,
  padding = 10, 
  className = '' 
}: { children: React.ReactNode, padding?: number, className?: string }) {
  const paddingClasses: Record<number, string> = {
    4: 'md:p-4',
    6: 'md:p-6', 
    8: 'md:p-8',
    10: 'md:p-10',
  };

  return (
    <div className={`relative p-4 ${paddingClasses[padding] || 'md:p-10'} border border-[var(--color-border)] rounded-sm flex flex-col space-y-1 ${className} backdrop-blur-md bg-[var(--color-main)]`}>
      {children}
    </div>
  );
}