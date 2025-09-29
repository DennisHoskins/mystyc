import { Activity } from 'lucide-react'

export default function SessionIcon({ size = 6 }: { size?: number }) {
  return (
    <Activity className={`w-${size} h-${size}`} />
  );    
}