import { IdCard } from 'lucide-react';

export default function MessageIcon({ size = 6 }: { size?: number }) {
  return (
    <IdCard className={`w-${size} h-${size}`} />
  );    
}