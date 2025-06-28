'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface UserPanelProps {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function UserPanel({ 
  user, 
  loading, 
  error,
  onRetry 
}: UserPanelProps) {

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <Heading level={3} className="mb-2 text-red-600">
            Error Loading User
          </Heading>
          <Text variant="muted" className="mb-6">
            {error}
          </Text>
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👤</div>
          <Heading level={3} className="mb-2">
            User Not Found
          </Heading>
          <Text variant="muted">
            The requested user could not be found.
          </Text>
        </div>
      </Card>
    );
  }

  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
                Contact Information
              </Text>
              <Text className='font-bold'>{user.email}</Text>
            </div>

            {user.dateOfBirth && (
              <div>
                <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
                  Date of Birth
                </Text>
                <Text>{formatDateForDisplay(user.dateOfBirth)}</Text>
                {user.zodiacSign && (
                  <Text variant="small" className="font-light text-gray-500">
                    {user.zodiacSign}
                  </Text>
                )}
              </div>
            )}

            <div>
              <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
                Roles & Permissions
              </Text>
              <Text className='font-bold'>{formatUserRoles(user.roles)}</Text>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
                Account Created
              </Text>
              <Text className='font-bold'>{formatDateForDisplay(user.createdAt)}</Text>
            </div>

            <div>
              <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
                Last Updated
              </Text>
              <Text className='font-bold'>{formatDateForDisplay(user.updatedAt)}</Text>
            </div>
          </div>
        </div>
      </Card>

   </div>
  );
}