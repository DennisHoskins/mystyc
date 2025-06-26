'use client';

import { useEffect } from 'react';

import { useUser, useBusy } from '@/components/layout/context/AppContext';
import { formatDateForDisplay } from '@/util/dateTime';

import Section from '@/components/ui/Section';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';

const Dashboard = () => {
  const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
      setBusy(false);
  }, [setBusy]);

  if (!user) {
    return;
  }

  const fullName = user.userProfile?.fullName || user.firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user.userProfile?.dateOfBirth);
  
  return (
    <Section background="white">
      <Heading level={2} className="mt-8 text-center">Welcome, {fullName} 👋</Heading>
        <Text variant="muted" className="mt-2 text-center">Glad to have you back.</Text>

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
        </div>
    </Section>
  );
};

export default Dashboard;