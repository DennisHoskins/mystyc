import { SunMoon } from 'lucide-react'

export default function AstrologyIcon({ size = 6 }: { size?: number }) {
  return (
    <SunMoon className={`w-${size} h-${size}`} />
  );    
}