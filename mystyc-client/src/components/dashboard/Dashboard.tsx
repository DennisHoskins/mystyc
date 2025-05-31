'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

import AccountDetails from './AccountDetails';

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
      <h2 className="mt-8 text-xl font-semibbold text-center">Welcome, {fullName} 👋</h2>
      <p className="mt-2 text-center text-gray-600">Glad to have you back.</p>

      <div className="mt-6 text-center">
        {birthday && (
          <p>
            🎂 <strong>Birthday:</strong> {birthday}
          </p>
        )}
        {user?.userProfile?.zodiacSign && (
          <p className="mt-2">
            🔮 <strong>Zodiac Sign:</strong> {user.userProfile.zodiacSign}
          </p>
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
          <p className="mt-2 text-xs text-gray-500 break-all max-w-xs">
            Notifications enabled ✓
          </p>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-500">
            Notification error: {error}
          </p>
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