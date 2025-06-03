'use client';

import { useEffect } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useBusy } from '@/components/context/BusyContext';
import { formatDateForDisplay } from '@/util/dateTime';

import PageContainer from '@/components/layout/PageContainer';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';

const Dashboard = () => {
  const { firebaseUser, user } = useAuth();
  const { setBusy } = useBusy();

  useEffect(() => {
      setBusy(false);
  }, [setBusy]);

  const fullName = user?.userProfile?.fullName || firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user?.userProfile?.dateOfBirth);
  
  return (
    <PageContainer>
    <Heading level={2} className="mt-8 text-center">Welcome, {fullName} 👋</Heading>
      <Text variant="muted" className="mt-2 text-center">Glad to have you back.</Text>

      <div className="mt-6 text-center">
        {birthday && (
          <Text>
            🎂 <strong>Birthday:</strong> {birthday}
          </Text>
        )}
        {user?.userProfile?.zodiacSign && (
          <Text className="mt-2">
            🔮 <strong>Zodiac Sign:</strong> {user.userProfile.zodiacSign}
          </Text>
        )}
      </div>
    </PageContainer>
  );
};

export default Dashboard;