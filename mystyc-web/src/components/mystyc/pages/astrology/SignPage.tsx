'use client'

import { useState, useEffect, useCallback }  from 'react';

import { SignComplete, ZodiacSignType } from 'mystyc-common';
import { getSign } from '@/server/actions/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import ConstellationPanel from '@/components/mystyc/ui/ConstellationPanel';
import MystycTitle from '../../ui/MystycTitle';
import MystycError from '../../ui/MystycError';
import SignDetailsPanel from './SignDetailsPanel';
import ElementDetailsPanel from './ElementDetailsPanel';
import HouseDetailsPanel from './HouseDetailsPanel';
import SignTarotPanel from './SignTarotPanel';
import SignLuckPanel from "./SignLuckPanel";
import ModalityDetailsPanel from './ModalityDetailsPanel';
import PolarityDetailsPanel from './PolarityDetailsPanel';
import EnergyTypesPanel from './EnergyTypesPanel';
import SignGemsPanel from './SignGemsPanel';
import SignAestheticPanel from './SignAestheticPanel';
import SignLifestylePanel from './SignLifestylePanel';
import SignPhysicalityPanel from './SignPhysicalityPanel';

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
    <div className='w-full h-full flex flex-col space-y-4'>
      <MystycTitle
        icon={getZodiacIcon(signData?.sign, 'w-14 h-14 text-white')}
        heading={signData?.sign}
        title={`${signData?.timing.dateRange.start} - ${signData?.timing.dateRange.end}, ${signData?.timing.season}`}
        subtitle={signData?.timing.seasonDescription}
      />
      <div className='grid grid-cols-3 gap-4 relative'>
        <ConstellationPanel sign={sign} />
        <Card className='col-span-2'>
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
    <div className='w-full h-full flex flex-col space-y-4'>
      <MystycTitle
        icon={getZodiacIcon(signData?.sign, 'w-14 h-14 text-white')}
        heading={signData?.sign || ""}
        title={`${signData?.timing.dateRange.start || ""} - ${signData?.timing.dateRange.end || ""}, ${signData?.timing.season || ""}`}
        subtitle={signData?.timing.seasonDescription || ""}
      />
      <div className='grid grid-cols-3 gap-4 relative'>
        <ConstellationPanel sign={sign} />
        <Card className='col-span-2'>
          <SignDetailsPanel sign={signData} />
        </Card>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <HouseDetailsPanel house={signData?.houseData} className='col-span-2' />
        <Card>
          <ElementDetailsPanel element={signData?.elementData} />
        </Card>
      </div>

      <div className='grid grid-cols-5 gap-4'>
        <Card className='!p-10 col-span-2'>
          <SignTarotPanel sign={signData} />
        </Card>
        <Card className='!p-10 col-span-3'>
          <SignGemsPanel sign={signData} />
        </Card>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col space-y-4'>
          <Card className='space-y-10 !p-10'>
            <SignLuckPanel sign={signData} />
          </Card>

          <Card className='space-y-10 !p-10'>
            <SignAestheticPanel sign={signData} />
            <SignLifestylePanel sign={signData} />
            <SignPhysicalityPanel sign={signData} />
          </Card>
        </div>
        <div className='flex flex-col space-y-4'>
          <ModalityDetailsPanel modality={signData?.modalityData} />
          <PolarityDetailsPanel polarity={signData?.polarityData} />
          <EnergyTypesPanel sign={signData} />
        </div>
      </div>
    </div>
  );
}
