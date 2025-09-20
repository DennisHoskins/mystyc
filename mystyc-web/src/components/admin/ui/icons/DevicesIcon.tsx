import { MonitorSmartphone } from 'lucide-react'

export default function DevicesIcon({ size = 6 }: { size?: number }) {
  return (
    <MonitorSmartphone className={`w-${size} h-${size}`} />
  )
}