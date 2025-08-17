import { UserProfile, ZodiacSignType } from 'mystyc-common';
import { getSign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useState, useEffect } from 'react';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import Capsule from '@/components/ui/Capsule';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function UserZodiacPanel({ user }: { user?: UserProfile | null }) {
  const [zodiacDescriptions, setZodiacDescriptions] = useState<Record<string, string>>({});

  const getZodiacInfo = async (sign?: ZodiacSignType | null): Promise<string> => {
    if (!sign) {
      return `Unable to load ${sign} data`;
    }
    try {
      const results = await getSign({deviceInfo: getDeviceInfo(), sign});
      return results.description;
    } catch (error) {
      logger.log(error);
      return `Error loading ${sign} data`;
    }
  }

  useEffect(() => {
    const fetchAllDescriptions = async () => {
      if (!user?.astrology) return;

      const signs = [
        user.astrology.sunSign,
        user.astrology.moonSign,
        user.astrology.risingSign,
        user.astrology.marsSign,
        user.astrology.venusSign
      ].filter(Boolean);

      const descriptions: Record<string, string> = {};
      
      for (const sign of signs) {
        if (sign) {
          descriptions[sign] = await getZodiacInfo(sign);
        }
      }
      
      setZodiacDescriptions(descriptions);
    };

    fetchAllDescriptions();
  }, [user?.astrology]);

  return (
    <div className='flex flex-col space-y-1'>
      <AdminPanelHeader
        icon={AstrologyIcon}
        heading='Astrology'
        href={`/admin/users/${user?.firebaseUid}/astrology`}
        tag={
          <Capsule
            label={user?.astrology?.sunSign || "Astrology"}
            href={`/admin/users/${user?.firebaseUid}/astrology`}
            icon={getZodiacIcon(user?.astrology?.sunSign, '!w-2 !h-2')}
          />
        }
      />
      <AdminDetailGrid>
        <Panel>
          <AdminDetailField
            label="Sun Sign"
            href={user?.astrology?.sunSign ? `/admin/astrology/signs/${user?.astrology?.sunSign}` : null}
            value={user && (user.astrology?.sunSign ? user.astrology?.sunSign : 'Not set')}
            text={user?.astrology?.sunSign ? zodiacDescriptions[user.astrology.sunSign] || 'Loading...' : undefined}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Moon Sign"
            href={user?.astrology?.moonSign ? `/admin/astrology/signs/${user?.astrology?.moonSign}` : null}
            value={user && (user.astrology?.moonSign ? user.astrology?.moonSign : 'Not set')}
            text={user?.astrology?.moonSign ? zodiacDescriptions[user.astrology.moonSign] || 'Loading...' : undefined}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Rising Sign"
            href={user?.astrology?.risingSign ? `/admin/astrology/signs/${user?.astrology?.risingSign}` : null}
            value={user && (user.astrology?.risingSign ? user.astrology?.risingSign : 'Not set')}
            text={user?.astrology?.risingSign ? zodiacDescriptions[user.astrology.risingSign] || 'Loading...' : undefined}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Mars Sign"
            href={user?.astrology?.marsSign ? `/admin/astrology/signs/${user?.astrology?.marsSign}` : null}
            value={user && (user.astrology?.marsSign ? user.astrology?.marsSign : 'Not set')}
            text={user?.astrology?.marsSign ? zodiacDescriptions[user.astrology.marsSign] || 'Loading...' : undefined}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Venus Sign"
            href={user?.astrology?.venusSign ? `/admin/astrology/signs/${user?.astrology?.venusSign}` : null}
            value={user && (user.astrology?.venusSign ? user.astrology?.venusSign : 'Not set')}
            text={user?.astrology?.venusSign ? zodiacDescriptions[user.astrology.venusSign] || 'Loading...' : undefined}
          />
        </Panel>
      </AdminDetailGrid>
    </div>
  );
}