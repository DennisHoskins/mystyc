import { Bell } from 'lucide-react'

export default function NotificationIcon({ size = 6 , className }: { size?: number, className?: string }) {
  return (
    <Bell className={`w-${size} h-${size} ${className}`} />
  );    
}