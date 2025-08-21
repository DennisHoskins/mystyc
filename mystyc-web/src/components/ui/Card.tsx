export default function Card({ 
  children, 
  className = '' 
}: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative p-4 border border-[var(--color-border)] rounded-sm flex flex-col space-y-1 ${className} backdrop-blur-md bg-[var(--color-main)]`}>
      <div className="sticky inset-0 backdrop-blur-md bg-[var(--color-main)] rounded-sm -z-10" />
      {children}
    </div>
  );
}
