import React, { useState, useEffect } from 'react';
import { PlanetInteraction, ElementInteraction, ModalityInteraction, Sign, PlanetType } from 'mystyc-common';
import { getPlanetInteraction, getElementInteraction, getModalityInteraction, getSign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Panel from '@/components/ui/Panel';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Link from '@/components/ui/Link';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';

interface UserCoreIdentityInteractionProps {
  planet1: PlanetType;
  planet2: PlanetType;
  sign1: string | undefined;
  sign2: string | undefined;
  label: React.ReactNode;
}

interface CoreInteraction {
  planetInteraction: PlanetInteraction;
  elementInteraction: ElementInteraction;
  modalityInteraction: ModalityInteraction;
  signs: { sign1: Sign; sign2: Sign };
}

export default function UserCoreIdentityInteraction({
  planet1,
  planet2,
  sign1,
  sign2,
  label
}: UserCoreIdentityInteractionProps) {
  const [interaction, setInteraction] = useState<CoreInteraction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sign1 || !sign2) {
      setInteraction(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchInteraction = async () => {
      setLoading(true);
      setError(null);

      try {
        const [planetInt, signInfo1, signInfo2] = await Promise.all([
          getPlanetInteraction({ deviceInfo: getDeviceInfo(), planet1, planet2 }),
          getSign({ deviceInfo: getDeviceInfo(), sign: sign1 as any }),
          getSign({ deviceInfo: getDeviceInfo(), sign: sign2 as any })
        ]);

        if (!planetInt || !signInfo1 || !signInfo2) {
          setError('Failed to load interaction data');
          return;
        }

        const [elementInt, modalityInt] = await Promise.all([
          getElementInteraction({ 
            deviceInfo: getDeviceInfo(), 
            element1: signInfo1.element as any, 
            element2: signInfo2.element as any 
          }),
          getModalityInteraction({ 
            deviceInfo: getDeviceInfo(), 
            modality1: signInfo1.modality as any, 
            modality2: signInfo2.modality as any 
          })
        ]);

        if (!elementInt || !modalityInt) {
          setError('Failed to load element/modality data');
          return;
        }

        setInteraction({
          planetInteraction: planetInt,
          elementInteraction: elementInt,
          modalityInteraction: modalityInt,
          signs: { sign1: signInfo1, sign2: signInfo2 }
        });
      } catch (err) {
        logger.error(`Error fetching ${planet1}-${planet2} interaction:`, err);
        setError('Failed to load interaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchInteraction();
  }, [planet1, planet2, sign1, sign2]);

  // Not set case
  if (!sign1 || !sign2) {
    return (
      <Panel>
        <AdminDetailField label={label} heading="Not set" text="" />
      </Panel>
    );
  }

  // Loading or error case
  if (loading || error || !interaction) {
    return (
      <Panel>
        <AdminDetailField 
          label={label} 
          heading={`${sign1}-${sign2}`} 
          text={loading ? "Loading..." : (error || "Error loading data")} 
        />
      </Panel>
    );
  }

  // Success case
  const { planetInteraction, elementInteraction, modalityInteraction } = interaction;
  const synthesizedText = `${planetInteraction.description} ${elementInteraction.description} ${modalityInteraction.description}`;
  const combinedAction = `${planetInteraction.action} Also: ${elementInteraction.action}`;

  return (
    <Panel>
      <AdminDetailField
        label={label}
        tag={
          <div className='flex space-x-1 items-center'>
            <Link href={`/admin/astrology/planet-interactions/${planetInteraction.planet1}-${planetInteraction.planet2}`}>
              {getDynamicIcon ? getDynamicIcon(planetInteraction.dynamic, 'w-3 h-3 text-white') : 
                <span className='text-[8px] text-white bg-gray-600 px-1 rounded'>{planetInteraction.dynamic}</span>}
            </Link>
          </div>
        }
        href={`/admin/astrology/planet-interactions/${planetInteraction.planet1}-${planetInteraction.planet2}`}
        heading={`${sign1}-${sign2}`}
        text={synthesizedText}
        subtext={combinedAction}
      />
    </Panel>
  );
}