'use client'

import { useState, useEffect, useCallback }  from 'react';

import { SignComplete, ZodiacSignType, Element, Modality, EnergyType } from 'mystyc-common';
import { getSign } from '@/server/actions/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import ConstellationPanel from '@/components/mystyc/ui/ConstellationPanel';
import MystycError from '../../ui/MystycError';
import SignDetailsPanel from './SignDetailsPanel';
import ElementDetailsPanel from './ElementDetailsPanel';
import ModalityDetailsPanel from './ModalityDetailsPanel';
import EnergyTypePanel from './EnergyTypePanel';
import MystycSidebar from '../../ui/MystycSidebar';

export default function SignPage({ sign } : { sign: ZodiacSignType }) {
  const [signData, setSignData] = useState<SignComplete | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSign = useCallback(async (sign: ZodiacSignType) => {
    try {
      const signData = await getSign({ deviceInfo: getDeviceInfo(), sign });
      setSignData(signData);
    } catch(err) {
      console.log(err);
      setError("Unable to load Sign information. Please try again.")
    }
  }, []);

  useEffect(() => {
    loadSign(sign);
  }, [sign, loadSign])

  if (error) {
    return (
      <div className='w-full h-full space-y-10 flex flex-col'>
        <div className='flex space-x-10'>
          <div>
            <Card>
              <ConstellationPanel sign={sign} showLabel={false} />
            </Card>
            <MystycSidebar />
          </div>
          <Card className='w-full h-full space-x-4 !flex-row'>
            <Panel className='items-center'>
              <MystycError 
                title={`Sorry, ${sign} :(`}
                error={error}
                onRetry={() => loadSign(sign)}
              />
            </Panel>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex space-x-10'>
      <div>
        <Card>
          <ConstellationPanel sign={sign} showLabel={false} />
        </Card>
        <MystycSidebar />
      </div>

      <div className="flex flex-col space-y-10">
        <Card>
          <SignDetailsPanel sign={signData} />

          <div className='grid grid-cols-2 gap-4 !mt-4'>
            <ElementDetailsPanel element={signData?.elementData as Element} />
            <ModalityDetailsPanel modality={signData?.modalityData as Modality} />
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <EnergyTypePanel energyType={signData?.energyTypeData as EnergyType} />
            <EnergyTypePanel energyType={signData?.elementData?.energyTypeData as EnergyType} />
            <EnergyTypePanel energyType={signData?.modalityData?.energyTypeData as EnergyType} />
          </div>
        </Card>
      </div>
    </div>
  );
}
