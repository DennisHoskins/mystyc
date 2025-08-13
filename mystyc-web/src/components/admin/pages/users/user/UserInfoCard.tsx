import Card from '@/components/ui/Card';
import UserInfoPanel from './UserInfoPanel';

export default function UserInfoCard({ firebaseUid }: { firebaseUid?: string | null }) {
  return (
    <Card className='min-h-22'>
      <UserInfoPanel firebaseUid={firebaseUid} />
    </Card>
  )
}