'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

import AccountDetails from './AccountDetails';
import Text from '@/components/ui/Text';
import FormError from '@/components/form/FormError';
import Heading from '@/components/ui/Heading';

const Dashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { firebaseUser, user, idToken } = useAuth();
  const router = useCustomRouter();
  const { setBusy } = useBusy();
  const { token, error } = useFirebaseMessaging();

  useEffect(() => {
      setBusy(false);
  }, [setBusy]);

  const editProfile = () => {
    router.push('/profile');
  };

  const sendNotification = async () => {
    try {
      await fetch('https://skull.international/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token }),
      });

    } catch (error) {
      logger.error('Error sending notification', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  const handleSendNotification = async () => {
    if (!token || !idToken) {
      return;
    }
    setTimeout(() => sendNotification(), 10 * 1000); // Send in 10 seconds
  };

  const fullName = user?.userProfile?.fullName || firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user?.userProfile?.dateOfBirth);
  
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
        {user?.userProfile?.zodiacSign && (
          <Text className="mt-2">
            🔮 <strong>Zodiac Sign:</strong> {user.userProfile.zodiacSign}
          </Text>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center w-full">
        <button
          onClick={editProfile}
          className="w-full max-w-xs text-center bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>

        {token && (
          <button
            onClick={handleSendNotification}
            className="mt-4 w-full max-w-xs text-center bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition"
          >
            Send Test Notification
          </button>
        )}

        {token && (
          <Text variant="small" className="mt-2 max-w-xs break-all">
            Notifications enabled ✓
          </Text>
        )}

        {error && (
          <div className="mt-2 max-w-xs">
            <FormError message={`Notification error: ${error}`} />
          </div>
        )}

        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className="mt-4 text-sm text-gray-600 underline hover:text-gray-800"
        >
          {showDetails ? 'Hide' : 'Show'} Account Details
        </button>

        {showDetails && (
          <div className="mt-6 w-full max-w-2xl">
            <AccountDetails firebaseUser={firebaseUser} user={user} />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;