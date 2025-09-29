import { Shield } from 'lucide-react'

export default function AuthenticationIcon({ size = 6 }: { size?: number }) {
  return (
    <Shield className={`w-${size} h-${size}`} />
  );    
}