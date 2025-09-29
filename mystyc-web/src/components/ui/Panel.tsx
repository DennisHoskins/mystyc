export default function Panel({ children, color = '#230537', padding = 10, className }: {  children: React.ReactNode, color?: string, padding?: number, className?: string }) {
  const paddingClasses: Record<number, string> = {
    4: 'md:p-4',
    6: 'md:p-6', 
    8: 'md:p-8',
    10: 'md:p-10',
  };

  return (
    <div
      className={`flex flex-col p-4 ${paddingClasses[padding] || 'md:p-10'} space-y-1 overflow-hidden rounded-md w-full border border-[var(--color-border)] ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}