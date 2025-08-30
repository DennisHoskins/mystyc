import { Palette } from 'lucide-react';

import { SignComplete } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Capsule from "@/components/ui/Capsule";

export default function SignAestheticPanel({ sign } : { sign: SignComplete | null }) {
  return(
    <div>
      <div className='flex flex-col'>
        <div className="flex space-x-2">
          <Palette className='w-6 h-6 text-white' />
          <Heading level={3}>Aesthetic</Heading>
        </div>
        <Heading level={4} className="mt-2 !text-gray-400">Fashion</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.aesthetic.fashionStyle.map((aesthetic, i) => (
            <Capsule key={'fashion-' + i} label={aesthetic} className='mt-1 mr-2' />
          ))}
        </div>
        <Heading level={4} className='!text-gray-400'>Home</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.aesthetic.homeDecor.map((aesthetic, i) => (
            <Capsule key={'home-' + i} label={aesthetic} className='mt-1 mr-2' />
          ))}
        </div>
        <Heading level={4} className='!text-gray-400'>Art</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.aesthetic.artStyles.map((aesthetic, i) => (
            <Capsule key={'art-' + i} label={aesthetic} className='mt-1 mr-2' />
          ))}
        </div>
      </div>
    </div>
  );
}