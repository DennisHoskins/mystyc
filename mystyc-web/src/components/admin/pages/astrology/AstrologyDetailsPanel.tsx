'use client'

import { useEffect, useState } from 'react';

import { EnergyType } from 'mystyc-common';
import { AstrologySummary } from 'mystyc-common/admin';
import { getAstrologySummary, getEnergyTypes } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminPanelLink from '@/components/admin/ui/AdminPanelLink';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import Energy from '@/components/ui/icons/astrology/Energy';
import { formatStringForDisplay } from '@/util/util';

export default function AstrologyTabPanel() {
  const [summary, setSummary] = useState<AstrologySummary | null>(null);
  const [energyTypes, setEnergyTypes] = useState<EnergyType[] | null>([]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await getAstrologySummary({deviceInfo: getDeviceInfo()});
        setSummary(summaryData);
        const listQuery = getDefaultListQuery(0);
        listQuery.limit = 100;
        const energyTypes = await getEnergyTypes({deviceInfo: getDeviceInfo(), ...listQuery})
        setEnergyTypes(energyTypes.data);
      } catch (err) {
        logger.error('Failed to load astrology summary:', err);
      }
    };

    loadSummary();
  }, []);

  const energyTypesList = energyTypes?.map((energyType) => {
    return {
      icon: <Energy size={3} />,
      label: formatStringForDisplay(energyType.energyType),
      href: '/admin/astrology/energy-types/' + energyType.energyType
    }
  })

  return (
    <div className='flex flex-col w-full space-y-8'>
      <AdminPanelLink
        label="Signs"
        total={summary?.signs}
        href='/admin/astrology/signs'
        sublinks={[
          {
            icon: getZodiacIcon("aquarius", 'w-3 h-3'),
            label: "Aquarius",
            href: '/admin/astrology/signs/Aquarius'
          },
          {
            icon: getZodiacIcon("aries", 'w-3 h-3'),
            label: "Aries",
            href: '/admin/astrology/signs/Aries'
          },
          {
            icon: getZodiacIcon("cancer", 'w-3 h-3'),
            label: "Cancer",
            href: '/admin/astrology/signs/Cancer'
          },
          {
            icon: getZodiacIcon("capricorn", 'w-3 h-3'),
            label: "Capricorn",
            href: '/admin/astrology/signs/Capricorn'
          },
          {
            icon: getZodiacIcon("gemini", 'w-3 h-3'),
            label: "Gemini",
            href: '/admin/astrology/signs/Gemini'
          },
          {
            icon: getZodiacIcon("leo", 'w-3 h-3'),
            label: "Leo",
            href: '/admin/astrology/signs/Leo'
          },
          {
            icon: getZodiacIcon("libra", 'w-3 h-3'),
            label: "Libra",
            href: '/admin/astrology/signs/Libra'
          },
          {
            icon: getZodiacIcon("pisces", 'w-3 h-3'),
            label: "Pisces",
            href: '/admin/astrology/signs/Pisces'
          },
          {
            icon: getZodiacIcon("sagittarius", 'w-3 h-3'),
            label: "Sagittarius",
            href: '/admin/astrology/signs/Sagittarius'
          },
          {
            icon: getZodiacIcon("scorpio", 'w-3 h-3'),
            label: "Scorpio",
            href: '/admin/astrology/signs/Scorpio'
          },
          {
            icon: getZodiacIcon("taurus", 'w-3 h-3'),
            label: "Taurus",
            href: '/admin/astrology/signs/Taurus'
          },
          {
            icon: getZodiacIcon("virgo", 'w-3 h-3'),
            label: "Virgo",
            href: '/admin/astrology/signs/Virgo'
          },
        ]}
      />
      <AdminPanelLink
        label="Elements"
        total={summary?.elements}
        href='/admin/astrology/elements'
        sublinks={[
          {
            icon: getElementIcon("air", 'w-3 h-3'),
            label: "Air",
            href: '/admin/astrology/elements/Air'
          },
          {
            icon: getElementIcon("earth", 'w-3 h-3'),
            label: "Earth",
            href: '/admin/astrology/elements/Earth'
          },
          {
            icon: getElementIcon("fire", 'w-3 h-3'),
            label: "Fire",
            href: '/admin/astrology/elements/Fire'
          },
          {
            icon: getElementIcon("water", 'w-3 h-3'),
            label: "Water",
            href: '/admin/astrology/elements/Water'
          },
        ]}
        links={[
          {
            label: "Element Interactions",
            total: summary?.elementInteractions,
            href: '/admin/astrology/element-interactions'
          }
        ]}
      />
      <AdminPanelLink
        label="Planets"
        total={summary?.planets}
        href='/admin/astrology/planets'
        sublinks={[
          {
            icon: getPlanetIcon("mars", 'w-3 h-3'),
            label: "Mars",
            href: '/admin/astrology/planets/Mars'
          },
          {
            icon: getPlanetIcon("moon", 'w-3 h-3'),
            label: "Moon",
            href: '/admin/astrology/planets/Moon'
          },
          {
            icon: getPlanetIcon("rising", 'w-3 h-3'),
            label: "Rising",
            href: '/admin/astrology/planets/Rising'
          },
          {
            icon: getPlanetIcon("sun", 'w-3 h-3'),
            label: "Sun",
            href: '/admin/astrology/planets/Sun'
          },
          {
            icon: getPlanetIcon("venus", 'w-3 h-3'),
            label: "Venus",
            href: '/admin/astrology/planets/Venus'
          },
        ]}
        links={[
          {
            label: "Planetary Positions",
            total: summary?.planetaryPositions,
            href: '/admin/astrology/planetary-positions'
          },
          {
            label: "Planet Interactions",
            total: summary?.planetInteractions,
            href: '/admin/astrology/planet-interactions'
          }
        ]}
      />
      <AdminPanelLink
        label="Modalities"
        total={summary?.modalities}
        href='/admin/astrology/modalities'
        sublinks={[
          {
            icon: getModalityIcon("cardinal", 'w-3 h-3'),
            label: "Cardinal",
            href: '/admin/astrology/modalities/Cardinal'
          },
          {
            icon: getModalityIcon("fixed", 'w-3 h-3'),
            label: "Fixed",
            href: '/admin/astrology/modalities/Fixed'
          },
          {
            icon: getModalityIcon("mutable", 'w-3 h-3'),
            label: "Mutable",
            href: '/admin/astrology/modalities/Mutable'
          },
        ]}
        links={[
          {
            label: "Modality Interactions",
            total: summary?.modalityInteractions,
            href: '/admin/astrology/modality-interactions'
          },
        ]}
      />
      <AdminPanelLink
        label="Dynamics"
        total={summary?.dynamics}
        href='/admin/astrology/dynamics'
        sublinks={[
          {
            icon: getDynamicIcon("amplification", 'w-3 h-3'),
            label: "Amplification",
            href: '/admin/astrology/dynamics/amplification'
          },
          {
            icon: getDynamicIcon("complementary", 'w-3 h-3'),
            label: "Complementary",
            href: '/admin/astrology/dynamics/complementary'
          },
          {
            icon: getDynamicIcon("harmony", 'w-3 h-3'),
            label: "Harmony",
            href: '/admin/astrology/dynamics/harmony'
          },
          {
            icon: getDynamicIcon("tension", 'w-3 h-3'),
            label: "Tension",
            href: '/admin/astrology/dynamics/tension'
          },
        ]}
      />
      <AdminPanelLink
        label="Energy Types"
        total={summary?.energyTypes}
        href='/admin/astrology/energy-types'
        sublinks={energyTypesList}
      />
   </div>
  );
}