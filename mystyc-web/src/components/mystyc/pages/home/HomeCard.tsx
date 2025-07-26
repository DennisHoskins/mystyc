import { AppUser } from '@/interfaces/app/app-user.interface';
import { formatDateForDisplay } from '@/util/dateTime';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function WelcomeCard({ user } : { user: AppUser }) {
  const fullName = user.userProfile?.fullName || user.firebaseUser?.displayName || 'User';
  const birthday = formatDateForDisplay(user.userProfile?.dateOfBirth);

  return (
    <Card className='p-6 space-y-6'>
      <Heading level={2} className="text-wrap">Welcome back, {fullName} 👋</Heading>
      <Text variant="muted" className="mt-4 text-center">Glad to have you back.</Text>

      <div className="text-center">
        <Text>
          🎂 <strong>Birthday:</strong> {birthday}
        </Text>
        <Text className="mt-2">
          🔮 <strong>Zodiac Sign:</strong> {user.userProfile.zodiacSign}
        </Text>
      </div>
    </Card>
  );
}