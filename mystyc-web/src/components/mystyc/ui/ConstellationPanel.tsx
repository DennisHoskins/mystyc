'use client'

import { useState, useEffect } from 'react';

import { ZodiacSignType } from 'mystyc-common';
import { data } from '@/components/ui/constellations/data';
import Constellation from '@/components/ui/constellations/Constellation';
import Panel from '@/components/ui/Panel';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Heading from '@/components/ui/Heading';
import { BackgroundStars } from '@/components/ui/constellations/BackgroundStars';

export default function ConstellationPanel({ sign, className, showLabel = false } : { sign: ZodiacSignType | null, className?: string, showLabel?: boolean }) {
  const [constellation, setConstellation] = useState<any | null>(null)

  useEffect(() => {
    if (!sign) return;
    const constellation = data[sign.toLowerCase() as keyof typeof data]
    setConstellation(constellation);
  }, [sign])

  return (
    <Panel padding={4} className={`flex-0 relative ${className} items-center justify-center`}>
      <div className='absolute w-full h-full -mt-12 -ml-12 flex'>
        <BackgroundStars density={100} />
      </div>
      {showLabel &&
        <div className='flex items-center justify-center space-x-1 p-4'>
          {getZodiacIcon(sign, 'w-10 h-10 text-white -ml-2')}
          <Heading level={1}>{sign}</Heading>
        </div>
      }
      <Constellation 
        constellationData={constellation} 
        dimBrightness={0.8}
        sparkleChance={1}
        className={`${showLabel ? '' : 'p-4'}`}
        showLabels={true}
      />
    </Panel>
  );
}
