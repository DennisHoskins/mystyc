'use client';

import { FC } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { User } from '@/interfaces/user.interface';
import Text from '@/components/ui/Text';

type Props = {
  firebaseUser: FirebaseAuthUser | null;
  user: User | null;
};

const AccountDetails: FC<Props> = ({ firebaseUser, user }) => {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h4 className="font-medium mb-2">Firebase Auth Info:</h4>
      <Text><strong>Email:</strong> {firebaseUser?.email}</Text>
      <Text><strong>User ID:</strong> {firebaseUser?.uid}</Text>
      {firebaseUser?.displayName && <Text><strong>Name:</strong> {firebaseUser.displayName}</Text>}
      <Text><strong>Email Verified:</strong> {firebaseUser?.emailVerified ? 'Yes' : 'No'}</Text>

      {user?.userProfile && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="font-medium mb-2">Database User Info:</h4>
          <Text><strong>Database ID:</strong> {user.userProfile.id}</Text>
          <Text><strong>Firebase UID:</strong> {user.userProfile.firebaseUid}</Text>
          <Text><strong>Email:</strong> {user.userProfile.email}</Text>
          {user.userProfile.fullName && <Text><strong>Full Name:</strong> {user.userProfile.fullName}</Text>}
          {user.userProfile.dateOfBirth && (
            <Text><strong>Date of Birth:</strong> {new Date(user.userProfile.dateOfBirth).toLocaleDateString()}</Text>
          )}
          <Text><strong>Account Created:</strong> {new Date(user.userProfile.createdAt).toLocaleString()}</Text>
          <Text><strong>Last Updated:</strong> {new Date(user.userProfile.updatedAt).toLocaleString()}</Text>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;