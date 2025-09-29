import { Stethoscope } from 'lucide-react';

import { SignComplete } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Capsule from "@/components/ui/Capsule";
import Text from '@/components/ui/Text';

export default function SignPhysicalityPanel({ sign } : { sign: SignComplete | null }) {
  return(
    <div>
      <div className='flex flex-col'>
        <div className="flex space-x-2">
          <Stethoscope className='w-6 h-6 text-white' />
          <Heading level={3}>Health &amp; Physicality</Heading>
        </div>
        <Heading level={4} color='text-gray-400'>Health Focus</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.physical.healthFocus.map((physical, i) => (
            <Capsule key={'health-' + i} label={physical} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
        <Heading level={4} color='text-gray-400'>Exercise Styles</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.physical.exerciseStyles.map((physical, i) => (
            <Capsule key={'exercise-' + i} label={physical} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
        <Heading level={4} color='text-gray-400' className='mt-2'>Body Parts</Heading>
        <div className="flex flex-wrap mt-1 mb-4">
          {sign?.physical.bodyParts.map((physical, i) => (
            <Capsule key={'body-' + i} label={physical} className='mt-1 mr-2' />
          ))}
          {!sign && (
            <Text variant='small' className='min-w-52'>{null}</Text>
          )}
        </div>
      </div>
    </div>
  );
}