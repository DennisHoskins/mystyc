import { Globe } from 'lucide-react';

export default function TrafficIcon({ size = 6 }: { size?: number }) {
  return (
    <Globe className={`w-${size} h-${size}`} />
  )
}