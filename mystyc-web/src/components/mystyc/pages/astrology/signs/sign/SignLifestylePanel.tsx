import { BriefcaseBusiness } from 'lucide-react';

import { SignComplete } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Capsule from "@/components/ui/Capsule";
import Text from '@/components/ui/Text';

export default function SignLifestylePanel({ sign } : { sign: SignComplete | null }) {
  return(
    <div>
      <div className='flex flex-col'>
        <div className="flex space-x-2">
          <BriefcaseBusiness className='w-6 h-6 text-white' />
          <Heading level={3}>Lifestyle Choices</Heading>
        </div>
        <Heading level={4} color='text-gray-400' className='mt-2'>Careers</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.lifestyle.careers.map((lifestyle, i) => (
            <Capsule key={'careers-' + i} label={lifestyle} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
        <Heading level={4} color='text-gray-400'>Cusines</Heading>
        <div className="flex flex-wrap mb-4">
          {sign?.lifestyle.cuisines.map((lifestyle, i) => (
            <Capsule key={'cusines-' + i} label={lifestyle} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
        <Heading level={4} color='text-gray-400'>Hobbies</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.lifestyle.hobbies.map((lifestyle, i) => (
            <Capsule key={'hobbies-' + i} label={lifestyle} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
        <Heading level={4} color='text-gray-400'>Music Genres</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.lifestyle.musicGenres.map((lifestyle, i) => (
            <Capsule key={'music-' + i} label={lifestyle} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
      </div>
    </div>
  );
}