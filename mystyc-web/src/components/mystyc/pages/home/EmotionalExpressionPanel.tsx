import { HandHeart } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

export default function EmotionalExpressionPanel({ user } : { user: AppUser }) {

console.log(user);

  return (
    <Panel className='w-full h-full'>
      <div className='flex items-center justify-center space-x-1'>
        <HandHeart className='w-8 h-8 text-white -ml-2' />
        <Heading level={2}>Emotional Expression</Heading>
      </div>
    </Panel>
  );
}
