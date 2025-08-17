export default function Panel({ children, className }: {  children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col p-4 space-y-1 bg-[#230537] rounded-md w-full ${className}`}>
      {children}
    </div>
  );
}