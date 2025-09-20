export default function Mars({ className = 'w-[10px] h-[10px] text-white' }: { className?: string }) {
  return (
    <svg className={`${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="15" r="4"/>
      <path d="M12.5 11.5L20 4"/>
      <path d="M15 4h5v5"/>
      <path d="M20 4l-3 3"/>
      <path d="M20 4l-3 0"/>
    </svg>
  )
}