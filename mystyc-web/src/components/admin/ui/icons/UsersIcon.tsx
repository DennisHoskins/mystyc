import { Users } from 'lucide-react';

export default function UserIcon({ size = 6 }: { size?: number }) {
  return (
    <Users className={`w-${size} h-${size}`} />
  );    
}