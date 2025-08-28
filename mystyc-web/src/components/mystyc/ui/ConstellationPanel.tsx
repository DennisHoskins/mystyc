'use client'

import { useState, useEffect } from 'react';

import { ZodiacSignType } from 'mystyc-common';
import { data } from '@/components/ui/constellations/data';
import Constellation from '@/components/ui/constellations/Constellation';
import Panel from '@/components/ui/Panel';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Heading from '@/components/ui/Heading';

export default function ConstellationPanel({ sign, showLabel = false } : { sign: ZodiacSignType, showLabel?: boolean }) {
  const [constellation, setConstellation] = useState<any | null>(null)

 console.log('All props:', { sign, showLabel }); // Add this line
 
  useEffect(() => {
    const constellation = data[sign.toLowerCase() as keyof typeof data]
    setConstellation(constellation);
  }, [sign])

  return (
    <Panel className='flex-0 !w-60'>
      <Constellation 
        constellationData={constellation} 
        dimBrightness={0.75}
        sparkleChance={1}
        className={`p-2 ${showLabel ? 'pb-0' : ''}`}
      />
      {showLabel &&
        <div className='flex items-center justify-center space-x-1'>
          {getZodiacIcon(sign, 'w-10 h-10 text-white -ml-2')}
          <Heading level={1}>{sign}</Heading>
        </div>
      }
    </Panel>
  );
}
