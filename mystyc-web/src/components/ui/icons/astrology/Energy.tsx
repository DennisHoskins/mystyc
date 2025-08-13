import { Zap } from 'lucide-react'

export default function Energy({ size = 6, color = 'gray-500' }: { size?: number, color?: string }) {
  return (
    <Zap className={`w-${size} h-${size} text-${color}`} />
  );    
}