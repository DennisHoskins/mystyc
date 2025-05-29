'use client';

import { FC, useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

import AccountDetails from './AccountDetails';

const Dashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { firebaseUser, user } = useAuth();
  const router = useCustomRouter();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler({
    component: 'Dashboard',
    showToast: true
  });

  useEffect(() => {
    try {
      setBusy(false);
    } catch (err) {
      handleError(err, { action: 'initialization' });
    }
  }, [setBusy, handleError]);

  const editProfile = () => {
    router.push('/profile');
  };

  const fullName = user?.userProfile?.fullName || firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user?.userProfile?.dateOfBirth);
  
  return (
    <>
      <h2 className="mt-8 text-xl font-semibold text-center">Welcome, {fullName} 👋</h2>
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