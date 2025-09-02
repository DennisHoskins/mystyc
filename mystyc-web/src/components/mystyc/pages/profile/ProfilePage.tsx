'use client'

import { useUser } from '@/components/ui/context/AppContext';
import MystycTitle from '../../ui/MystycTitle';
import UserStar from '@/components/ui/icons/UserStar';
import CoreIdentityCard from './CoreIdentityCard';
import EmotionalExpressionPanel from './EmotionalExpressionPanel';
import RelationshipsPanel from './RelationshipsPanel';
import { formatDateForDisplay } from '@/util/dateTime';

export default function ProfilePage() {
  const user = useUser();
  if (!user || !user.userProfile.astrology) {
    return null;
  }

  const formatTime = (time: string | undefined): string => {
    if (!time) return "12:00am";
    const [hoursStr, minutes = "00"] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // convert 0 → 12, 13 → 1, etc.
    return `${hours}:${minutes.padStart(2, "0")} ${suffix}`;
  };

  return (
    <div className='w-full flex flex-col space-y-4'>
      <MystycTitle
        icon={<UserStar width={56} height={56} className='text-white' />}
        heading={user.name}
        title={formatDateForDisplay(user.userProfile.dateOfBirth, false) + " @ " + formatTime(user.userProfile.timeOfBirth)}
        subtitle={user.userProfile.birthLocation?.formattedAddress + " (" + user.userProfile.birthLocation?.coordinates.lat + " ° , " + user.userProfile.birthLocation?.coordinates.lng + " ° )"}
      />
      <div className='flex flex-col space-y-4'>
        <CoreIdentityCard user={user} />
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <EmotionalExpressionPanel user={user} />
          <RelationshipsPanel user={user} />
        </div>
      </div>
    </div>
  )
}
