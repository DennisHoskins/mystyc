export default function AppTransition({ children }: { children: React.ReactNode }) {
  return (
    <div id="app" className="flex-1 flex flex-col w-full min-h-0">
      {children}
    </div>
  );
}
