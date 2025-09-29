export default function Main({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <main className={`flex flex-col w-full min-h-0 items-center ${className}`}>
      {children}
    </main>
  );
}