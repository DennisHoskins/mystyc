import { UserProfile } from 'mystyc-common/schemas';
import AdminCard from '../../ui/AdminCard';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';

export default function UsersCard({ users, total, href }: { users: UserProfile[], total?: number | null, href: string }) {
  return (
    <AdminCard
      icon={<UsersIcon />}
      title='Users'
      href={href}
    >
      <>
        {total &&
          <div className='flex flex-col space-y-2'>
            {users.map((user) => (
              <Link 
                key={user.firebaseUid} 
                href={`/admin/users/${user.firebaseUid}`}
                className="flex !flex-row items-center space-x-4"
              >
                <Panel padding={4} className='overflow-hidden'>
                  <Heading level={6}>{user.email}</Heading>
                  <Text variant='xs'>{user.firebaseUid}</Text>
                </Panel>
              </Link>
            ))}
          </div>        
        }
      </>
    </AdminCard>
  );
}