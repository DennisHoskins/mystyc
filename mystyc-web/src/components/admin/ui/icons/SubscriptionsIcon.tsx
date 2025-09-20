import { CircleDollarSign } from 'lucide-react'

export default function SubscriptionsIcon({ size = 6 }: { size?: number }) {
  return (
    <CircleDollarSign className={`w-${size} h-${size}`} />
  );    
}