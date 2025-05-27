'use client';

import { FC } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { User } from '@/interfaces/user.interface';

type Props = {
  firebaseUser: FirebaseAuthUser | null;
  user: User | null;
};

const AccountDetails: FC<Props> = ({ firebaseUser, user }) => {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h4 className="font-medium mb-2">Firebase Auth Info:</h4>
      <p><strong>Email:</strong> {firebaseUser?.email}</p>
      <p><strong>User ID:</strong> {firebaseUser?.uid}</p>
      {firebaseUser?.displayName && <p><strong>Name:</strong> {firebaseUser.displayName}</p>}
      <p><strong>Email Verified:</strong> {firebaseUser?.emailVerified ? 'Yes' : 'No'}</p>

      {user?.userProfile && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="font-medium mb-2">Database User Info:</h4>
          <p><strong>Database ID:</strong> {user.userProfile.id}</p>
          <p><strong>Firebase UID:</strong> {user.userProfile.firebaseUid}</p>
          <p><strong>Email:</strong> {user.userProfile.email}</p>
          {user.userProfile.fullName && <p><strong>Full Name:</strong> {user.userProfile.fullName}</p>}
          {user.userProfile.dateOfBirth && (
            <p><strong>Date of Birth:</strong> {new Date(user.userProfile.dateOfBirth).toLocaleDateString()}</p>
          )}
          <p><strong>Account Created:</strong> {new Date(user.userProfile.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(user.userProfile.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;