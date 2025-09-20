import { Sparkle } from 'lucide-react'

export default function AiIcon({ size = 6 }: { size?: number }) {
  return (
    <Sparkle className={`w-${size} h-${size}`} />
  )
}