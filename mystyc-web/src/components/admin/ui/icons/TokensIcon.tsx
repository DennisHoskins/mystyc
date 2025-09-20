import { Key } from 'lucide-react';

export default function MessageIcon({ size = 6 }: { size?: number }) {
  return (
    <Key className={`w-${size} h-${size}`} />
  );    
}