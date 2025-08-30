export default function Panel({ children, color = '#230537', className }: {  children: React.ReactNode, color?: string, className?: string }) {
  return (
    <div
      className={`flex flex-col p-10 space-y-1 overflow-hidden rounded-md w-full border border-[var(--color-border)] ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}