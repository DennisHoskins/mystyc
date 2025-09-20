import { LayoutDashboard } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <LayoutDashboard className={`w-${size} h-${size}`} />
  );    
}