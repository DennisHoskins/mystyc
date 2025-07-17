'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClient } from '@/api/apiClient';
import { useUser, useBusy } from '@/components/ui/layout/context/AppContext';
import { Content } from '@/interfaces/content.interface';
import { formatDateForDisplay } from '@/util/dateTime';

import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';

const Dashboard = () => {
  const [data, setData] = useState<Content | null>(null);
  const user = useUser();
  const { setBusy } = useBusy();

  const loadContent = useCallback(async () => {
    if (!user) {
      return;
    }

    setBusy(1000);

    try {
      const reply = await apiClient.getUserContent();
      setData(reply);
    } catch (err) {

    } finally {
      setBusy(false); 
    }
  }, [user]);

  useEffect(() => {
    loadContent();
  }, [loadContent])

  if (!user || !data) {
    return;
  }

  const fullName = user.userProfile?.fullName || user.firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user.userProfile?.dateOfBirth);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-64 h-64">
      <Heading level={2} className="mt-8 text-center text-wrap">Welcome, {fullName} 👋</Heading>
      <Text variant="muted" className="mt-4 text-center">Glad to have you back.</Text>

      <div className="mt-6 text-center">
        {birthday && (
          <Text>
            🎂 <strong>Birthday:</strong> {birthday}
          </Text>
        )}
        {user.userProfile?.zodiacSign && (
          <Text className="mt-2">
            🔮 <strong>Zodiac Sign:</strong> {user.userProfile.zodiacSign}
          </Text>
        )}

        {data ? (
          <Text>{data.message}</Text>
        ) : (
          <Text>Loading...</Text>
        )}
      </div>
    </div>
  );
};

export default Dashboard;