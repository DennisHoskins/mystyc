export default function Venus({ className = 'w-[10px] h-[10px] text-white' }: { className?: string }) {
  return (
    <svg className={`${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="6" r="4"/>
      <path d="M12 10v10"/>
      <path d="M8 16h8"/>
    </svg>
  )
}