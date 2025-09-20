import { Mail } from 'lucide-react'

export default function MessageIcon({ size = 6 }: { size?: number }) {
  return (
    <Mail className={`w-${size} h-${size}`} />
  );    
}