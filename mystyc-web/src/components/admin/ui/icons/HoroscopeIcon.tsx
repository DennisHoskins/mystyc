import { SunMoon } from 'lucide-react'

export default function HoroscopeIcon({ size = 6 }: { size?: number }) {
  return (
    <SunMoon className={`w-${size} h-${size} text-gray-500`} />
  );    
}