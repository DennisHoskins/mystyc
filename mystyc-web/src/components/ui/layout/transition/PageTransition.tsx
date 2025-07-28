export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div id="page" className="flex-1 flex flex-col w-full min-h-0">
      {children}
    </div>
  );
}
