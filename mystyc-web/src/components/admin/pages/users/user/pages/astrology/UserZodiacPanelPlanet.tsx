import React, { useState, useEffect } from 'react';
import { PlanetType, ZodiacSignType, Sign, PlanetaryPosition } from 'mystyc-common';
import { getSign, getPlanetaryPosition } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Panel from '@/components/ui/Panel';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Energy from '@/components/ui/icons/astrology/Energy';
import Link from '@/components/ui/Link';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

interface UserZodiacPanelPlanetProps {
  planet: PlanetType;
  sign: ZodiacSignType | undefined;
  icon: React.ReactNode;
  label: string;
}

interface PlanetData {
  position: PlanetaryPosition;
  signData: Sign;
}

export default function UserZodiacPanelPlanet({ 
  planet, 
  sign, 
  icon, 
  label 
}: UserZodiacPanelPlanetProps) {
  const [planetData, setPlanetData] = useState<PlanetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sign) {
      setPlanetData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchPlanetData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [position, signData] = await Promise.all([
          getPlanetaryPosition({ deviceInfo: getDeviceInfo(), planet, sign }),
          getSign({ deviceInfo: getDeviceInfo(), sign })
        ]);

        if (position && signData) {
          setPlanetData({ position, signData });
        } else {
          setError('Failed to load planet data');
        }
      } catch (err) {
        logger.log(`Error fetching data for ${planet} in ${sign}:`, err);
        setError('Failed to load planet data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetData();
  }, [planet, sign]);


console.log(error);

  // Not set case
  if (!sign) {
    return (
      <Panel>
        <AdminDetailField
          label={
            <div className='text-[11px] text-gray-500 flex flex-1 items-center'>
              {icon}
              <span className='ml-1'>{label}</span>
            </div>
          }
          value="Not set"
          text=""
        />
      </Panel>
    );
  }

  // Loading case
  if (loading || !planetData) {
    return (
      <Panel>
        <AdminDetailField
          label={
            <div className='text-[11px] text-gray-500 flex flex-1 items-center'>
              {icon}
              <span className='ml-1'>{label}</span>
            </div>
          }
          value={
            <div className='flex items-center space-x-1 py-1'>
              {getZodiacIcon(sign, 'w-3 h-3')}
              <span className='text-gray-100'>{sign}</span>
            </div>
          }
          text={loading ? "Loading..." : "Error loading data"}
        />
      </Panel>
    );
  }

  // Success case
  return (
    <Panel>
      <AdminDetailField
        label={
          <div className='text-[11px] text-gray-500 flex flex-1 items-center'>
            {icon}
            <span className='ml-1'>{label}</span>
          </div>
        }
        tag={
          <div className='flex space-x-1 items-center'>
            <Link href={`/admin/astrology/elements/${planetData.signData.element}`}>
              {getElementIcon(planetData.signData.element, 'w-3 h-3 text-white')}
            </Link>
            <Link href={`/admin/astrology/modalities/${planetData.signData.modality}`}>
              {getModalityIcon(planetData.signData.modality, 'w-3 h-3 text-white')}
            </Link>
            <Link href={`/admin/astrology/energy-types/${planetData.position.energyType}`}>
              <Energy size={3} />
            </Link>
          </div>
        }
        href={`/admin/astrology/planetary-positions/planetary-position/${planet}/${sign}`}
        value={
          <div className='flex items-center space-x-1 py-1'>
            {getZodiacIcon(sign, 'w-3 h-3')}
            <span className='text-gray-100'>{sign}</span>
          </div>
        }
        text={planetData.position.description}
      />
    </Panel>
  );
}