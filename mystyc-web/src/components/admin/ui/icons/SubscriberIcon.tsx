import { CircleDollarSign } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <CircleDollarSign className={`w-${size} h-${size}`} />
  );    
}