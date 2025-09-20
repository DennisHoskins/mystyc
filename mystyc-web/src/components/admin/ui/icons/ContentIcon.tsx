import { BookOpenText } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <BookOpenText className={`w-${size} h-${size}`} />
  );    
}