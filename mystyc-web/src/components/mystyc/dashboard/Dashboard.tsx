'use client';

import { useEffect } from 'react';

import { useApp } from '@/components/context/AppContext';
import { useBusy } from '@/components/context/BusyContext';
import { formatDateForDisplay } from '@/util/dateTime';

import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';

const Dashboard = () => {
  const { app } = useApp();
  const { setBusy } = useBusy();

  useEffect(() => {
      setBusy(false);
  }, [setBusy]);

  if (!app || !app.user) {
    return;
  }

  const fullName = app.user.userProfile?.fullName || app.user.firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(app.user.userProfile?.dateOfBirth);
  
  return (
    <>
    <Heading level={2} className="mt-8 text-center">Welcome, {fullName} 👋</Heading>
      <Text variant="muted" className="mt-2 text-center">Glad to have you back.</Text>

      <div className="mt-6 text-center">
        {birthday && (
          <Text>
            🎂 <strong>Birthday:</strong> {birthday}
          </Text>
        )}
        {app.user.userProfile?.zodiacSign && (
          <Text className="mt-2">
            🔮 <strong>Zodiac Sign:</strong> {app.user.userProfile.zodiacSign}
          </Text>
        )}
      </div>
    </>
  );
};

export default Dashboard;